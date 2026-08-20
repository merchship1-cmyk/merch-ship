import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import type {
  TransformationAcceptance,
  TransformationResult,
} from '../domain/transformation';
import { colors, spacing } from '../theme';

type Props = {
  result: TransformationResult;
  onAccept: (acceptance: TransformationAcceptance) => void;
  onReject: () => void;
};

export function ClarityAcceptanceScreen({
  result,
  onAccept,
  onReject,
}: Props) {
  const nextMove = result.plan[0];

  const accept = () => {
    onAccept({
      runId: result.id,
      accepted: true,
      acceptedAt: new Date().toISOString(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>PHASE 1A · CLARITY CHECK</Text>
        <Text style={styles.heading}>Confirm the direction before execution.</Text>
        <Text style={styles.subheading}>
          Zenzy has turned your starting signal into one goal, one next move,
          and a bounded plan. Nothing moves forward until you accept it.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.label}>CLEAN GOAL</Text>
          <Text style={styles.goal}>{result.objective}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>NEXT MOVE</Text>
          <Text style={styles.nextMove}>{nextMove.action}</Text>
          <Text style={styles.done}>DONE WHEN: {nextMove.definitionOfDone}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>MICRO-PLAN</Text>
          {result.plan.map((step, index) => (
            <View key={step.id} style={styles.planItem}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.planCopy}>
                <Text style={styles.planTitle}>{step.title}</Text>
                <Text style={styles.body}>{step.action}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>RESULT PREVIEW</Text>
          <Text style={styles.preview}>{result.createdOutput.title}</Text>
          <Text style={styles.body}>
            Accepting this direction opens the execution path and the usable
            output Zenzy generated for this run.
          </Text>
        </View>
      </View>

      <PrimaryButton label="Accept next move" onPress={accept} />

      <Pressable
        accessibilityRole="button"
        onPress={onReject}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryLabel}>Change the input</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heading: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '900',
  },
  subheading: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  goal: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 31,
    fontWeight: '900',
  },
  nextMove: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '800',
  },
  done: {
    color: colors.green,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  planItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  number: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  numberText: {
    color: colors.blue,
    fontWeight: '900',
  },
  planCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  planTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  preview: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
  },
  secondary: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  secondaryLabel: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '800',
  },
});
