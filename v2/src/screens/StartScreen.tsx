import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

type Props = {
  loading: boolean;
  error: string | null;
  remoteAuthenticated?: boolean;
  onStart: (input: string) => Promise<void>;
};

export function StartScreen({
  loading,
  error,
  remoteAuthenticated = false,
  onStart,
}: Props) {
  const [input, setInput] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>ZENZY · PHASE 0</Text>
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>MESS → CLARITY → EXECUTION</Text>
          <Text style={styles.title}>What are you trying to get done?</Text>
          <Text style={styles.subtitle}>
            Bring one idea, goal, or unfinished piece of work. Zenzy will turn
            it into a clear next result.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            testID="input-textarea"
            accessibilityLabel="What are you trying to get done?"
            multiline
            maxLength={4000}
            onChangeText={setInput}
            placeholder="Example: I need to turn my service idea into something I can send to a customer."
            placeholderTextColor={colors.muted}
            style={styles.input}
            textAlignVertical="top"
            value={input}
          />
          <Text style={styles.counter}>{input.length}/4000</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          testID="input-submit"
          label="Build my next move"
          loading={loading}
          disabled={input.trim().length < 3}
          onPress={() => onStart(input)}
        />

        <View style={styles.promise}>
          <Text style={styles.promiseTitle}>
            {remoteAuthenticated ? 'Identity protected' : 'No account required'}
          </Text>
          <Text style={styles.promiseText}>
            {remoteAuthenticated
              ? 'Remote runs are stored under your verified account.'
              : 'Your first useful result comes before sign-up.'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  badgeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heading: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
  },
  inputCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
  },
  input: {
    minHeight: 150,
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
  },
  counter: {
    alignSelf: 'flex-end',
    color: colors.muted,
    fontSize: 12,
  },
  error: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '600',
  },
  promise: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  promiseTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  promiseText: {
    color: colors.muted,
    textAlign: 'center',
  },
});
