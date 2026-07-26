import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import type {
  TransformationEvidence,
  TransformationResult,
} from './src/domain/transformation';
import { OutcomeScreen } from './src/screens/OutcomeScreen';
import { StartScreen } from './src/screens/StartScreen';
import { TransformationScreen } from './src/screens/TransformationScreen';
import { runTransformation } from './src/services/transformationClient';
import { colors } from './src/theme';

export default function App() {
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [evidence, setEvidence] = useState<TransformationEvidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (input: string) => {
    setLoading(true);
    setError(null);

    try {
      setResult(await runTransformation(input));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Zenzy could not build this transformation yet.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setEvidence(null);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {!result ? (
        <StartScreen loading={loading} error={error} onStart={handleStart} />
      ) : evidence ? (
        <OutcomeScreen
          result={result}
          evidence={evidence}
          onReset={handleReset}
        />
      ) : (
        <TransformationScreen result={result} onComplete={setEvidence} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
