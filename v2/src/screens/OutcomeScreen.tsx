import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import type {
  TransformationEvidence,
  TransformationResult,
} from '../domain/transformation';
import { colors, spacing } from '../theme';

type Props = {
  result: TransformationResult;
  evidence: TransformationEvidence;
  onReset: () => void;
};

export function OutcomeScreen({ result, evidence, onReset }: Props) {
  const measures = [
    { label: 'TIME SAVED', value: evidence.timeSavedMinutes + ' min' },
    { label: 'STEPS REMOVED', value: String(evidence.stepsRemoved) },
    { label: 'CLARITY GAIN', value: evidence.clarityGain + '/5' },
    { label: 'OUTPUT', value: evidence.outputProduced ? 'Produced' : 'Not yet' },
    {
      label: 'USE AGAIN',
      value: evidence.wouldUseAgain ? 'Yes' : 'No',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>✓</Text>
      </View>
      <Text style={styles.kicker}>TRANSFORMATION COMPLETE</Text>
      <Text style={styles.heading}>You moved from mess to execution.</Text>
      <Text style={styles.summary}>{result.createdOutput.title}</Text>

      <View style={styles.grid}>
        {measures.map((measure) => (
          <View key={measure.label} style={styles.metric}>
            <Text style={styles.metricLabel}>{measure.label}</Text>
            <Text style={styles.metricValue}>{measure.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Phase 0 evidence captured</Text>
        <Text style={styles.noticeBody}>
          This local beta record proves the loop completed. Server persistence
          remains disabled until the approved Supabase environment is
          configured.
        </Text>
      </View>

      <PrimaryButton label="Run another transformation" onPress={onReset} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
  },
  markText: {
    color: colors.green,
    fontSize: 32,
    fontWeight: '900',
  },
  kicker: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heading: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '900',
  },
  summary: {
    color: colors.muted,
    fontSize: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  metricValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  notice: {
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
    paddingLeft: spacing.md,
    gap: spacing.xs,
  },
  noticeTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  noticeBody: {
    color: colors.muted,
    lineHeight: 21,
  },
});
