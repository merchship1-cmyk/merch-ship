import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import type {
  TransformationEvidence,
  TransformationResult,
} from './src/domain/transformation';
import { AuthScreen } from './src/screens/AuthScreen';
import { OutcomeScreen } from './src/screens/OutcomeScreen';
import { StartScreen } from './src/screens/StartScreen';
import { TransformationScreen } from './src/screens/TransformationScreen';
import {
  isRemoteMode,
  runTransformation,
} from './src/services/transformationClient';
import { colors, spacing } from './src/theme';

function ZenzyApp() {
  const auth = useAuth();
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [evidence, setEvidence] = useState<TransformationEvidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setEvidence(null);
    setError(null);
  }, [auth.session?.user.id]);

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

  if (isRemoteMode && !auth.ready) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.green} size="large" />
      </SafeAreaView>
    );
  }

  if (isRemoteMode && (!auth.configured || !auth.session)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {isRemoteMode && auth.session ? (
        <View style={styles.sessionBar}>
          <Text numberOfLines={1} style={styles.sessionEmail}>
            {auth.session.user.email ?? 'Authenticated user'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void auth.signOut().catch(() => {
                setError('Sign out could not be completed.');
              });
            }}
          >
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.content}>
        {!result ? (
          <StartScreen
            loading={loading}
            error={error}
            remoteAuthenticated={isRemoteMode}
            onStart={handleStart}
          />
        ) : evidence ? (
          <OutcomeScreen
            result={result}
            evidence={evidence}
            onReset={handleReset}
          />
        ) : (
          <TransformationScreen result={result} onComplete={setEvidence} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ZenzyApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  sessionBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sessionEmail: { flex: 1, color: colors.muted, fontSize: 12 },
  signOut: { color: colors.blue, fontWeight: '800' },
});
