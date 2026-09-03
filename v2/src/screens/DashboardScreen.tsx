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
import type { DashboardSnapshot } from '../domain/dashboard';
import { colors, spacing } from '../theme';

type Props = {
  snapshot: DashboardSnapshot;
  loading: boolean;
  error: string | null;
  remoteAuthenticated?: boolean;
  canContinue: boolean;
  currentWork: string | null;
  onStart: (input: string) => Promise<void>;
  onContinue: () => void;
};

export function DashboardScreen({
  snapshot,
  loading,
  error,
  remoteAuthenticated = false,
  canContinue,
  currentWork,
  onStart,
  onContinue,
}: Props) {
  const [input, setInput] = useState('');
  const statuses = [
    { label: 'NOW', value: snapshot.now },
    { label: 'NEXT', value: snapshot.next },
    { label: 'LATER', value: snapshot.later },
    { label: 'BLOCKED', value: snapshot.blocked },
    { label: 'DONE', value: snapshot.done },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        testID="zenzy-dashboard"
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>ZENZY · HOME</Text>
        </View>

        {canContinue ? (
          <>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>WELCOME BACK</Text>
              <Text style={styles.title}>Continue where you left off.</Text>
              <Text style={styles.subtitle}>{snapshot.currentUnderstanding}</Text>
            </View>

            {currentWork ? (
              <View style={styles.resumeCard}>
                <Text style={styles.resumeLabel}>ACTIVE WORK</Text>
                <Text style={styles.resumeValue}>{currentWork}</Text>
                <Text style={styles.resumeLabel}>NEXT</Text>
                <Text style={styles.resumeNext}>{snapshot.next}</Text>
              </View>
            ) : null}

            <PrimaryButton
              testID="dashboard-continue"
              label="Continue where I left off"
              onPress={onContinue}
            />
          </>
        ) : (
          <>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>ONE REQUIRED INPUT</Text>
              <Text style={styles.title}>What are you trying to get done?</Text>
              <Text style={styles.subtitle}>
                Type it the way you would say it. You do not need to know what a
                workflow, engine, or system is.
              </Text>
            </View>

            <View style={styles.inputCard}>
              <TextInput
                testID="input-textarea"
                accessibilityLabel="What are you trying to get done?"
                multiline
                maxLength={4000}
                onChangeText={setInput}
                placeholder="Example: I want to turn my service into a simple offer I can explain and sell."
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
              label="Generate My ZENZY Start"
              loading={loading}
              disabled={input.trim().length < 3}
              onPress={() => onStart(input)}
            />

            <Text style={styles.identityNote}>
              {remoteAuthenticated
                ? 'Your work is protected under your verified account.'
                : 'Your first useful result comes before sign-up.'}
            </Text>
          </>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressHeading}>
            <Text style={styles.progressTitle}>YOUR WORK AT A GLANCE</Text>
            <Text style={styles.savedText}>
              Saved {new Date(snapshot.updatedAt).toLocaleString()}
            </Text>
          </View>

          {statuses.map((status, index) => (
            <View
              key={status.label}
              style={[
                styles.statusRow,
                index < statuses.length - 1 ? styles.statusDivider : null,
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  status.label === 'BLOCKED' &&
                  snapshot.blocked !== 'Nothing blocked right now.'
                    ? styles.blockedLabel
                    : null,
                ]}
              >
                {status.label}
              </Text>
              <Text style={styles.statusText}>{status.value}</Text>
            </View>
          ))}
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
    paddingVertical: spacing.xl,
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
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
  },
  resumeCard: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
  },
  resumeLabel: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resumeValue: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  resumeNext: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  inputCard: {
    minHeight: 176,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 132,
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
  identityNote: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  progressSection: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 18,
  },
  progressHeading: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surfaceRaised,
  },
  progressTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  savedText: {
    color: colors.muted,
    fontSize: 11,
  },
  statusRow: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusLabel: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  blockedLabel: {
    color: colors.red,
  },
  statusText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
