import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ChoiceChip } from '../components/ChoiceChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { StepRail } from '../components/StepRail';
import {
  transformationEvidenceSchema,
  type TransformationEvidence,
  type TransformationResult,
} from '../domain/transformation';
import { colors, spacing } from '../theme';

type Props = {
  result: TransformationResult;
  onComplete: (evidence: TransformationEvidence) => void;
};

export function TransformationScreen({ result, onComplete }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeSaved, setTimeSaved] = useState('');
  const [stepsRemoved, setStepsRemoved] = useState('');
  const [clarityGain, setClarityGain] = useState(0);
  const [outputProduced, setOutputProduced] = useState<boolean | null>(null);
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const complete = () => {
    if (
      timeSaved.trim() === '' ||
      stepsRemoved.trim() === '' ||
      outputProduced === null ||
      wouldUseAgain === null
    ) {
      setError('Record all five transformation measures to finish.');
      return;
    }

    const parsed = transformationEvidenceSchema.safeParse({
      runId: result.id,
      timeSavedMinutes: Number(timeSaved),
      stepsRemoved: Number(stepsRemoved),
      clarityGain,
      outputProduced,
      wouldUseAgain,
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    });

    if (!parsed.success) {
      setError('Use whole numbers and select a clarity score from 1 to 5.');
      return;
    }

    onComplete(parsed.data);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>YOUR TRANSFORMATION</Text>
        <Text style={styles.heading}>{result.objective}</Text>
      </View>

      <StepRail activeIndex={activeIndex} />

      <View style={styles.card}>
        {activeIndex === 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ORIGINAL SIGNAL</Text>
            <Text style={styles.body}>{result.idea.signal}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>FINISH LINE</Text>
            <Text style={styles.strongBody}>{result.idea.finishLine}</Text>
          </View>
        ) : null}

        {activeIndex === 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EXECUTION PLAN</Text>
            {result.plan.map((step, index) => (
              <View key={step.id} style={styles.planItem}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.planCopy}>
                  <Text style={styles.planTitle}>{step.title}</Text>
                  <Text style={styles.body}>{step.action}</Text>
                  <Text style={styles.done}>
                    DONE WHEN: {step.definitionOfDone}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {activeIndex === 2 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>USABLE OUTPUT</Text>
            <Text style={styles.outputTitle}>{result.createdOutput.title}</Text>
            <Text style={styles.outputBody}>{result.createdOutput.body}</Text>
            <View style={styles.successTag}>
              <Text style={styles.successTagText}>FIRST RESULT CREATED</Text>
            </View>
          </View>
        ) : null}

        {activeIndex === 3 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEXT ACTIONS</Text>
            {result.schedule.map((item) => (
              <View key={item.label} style={styles.scheduleItem}>
                <View style={styles.scheduleTop}>
                  <Text style={styles.scheduleLabel}>{item.label}</Text>
                  <Text style={styles.duration}>
                    {item.durationMinutes} MIN
                  </Text>
                </View>
                <Text style={styles.body}>{item.action}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {activeIndex === 4 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REVIEW THE RESULT</Text>
            <Text style={styles.strongBody}>{result.review.prompt}</Text>
            {result.review.successCriteria.map((criterion) => (
              <Text key={criterion} style={styles.criterion}>
                ✓ {criterion}
              </Text>
            ))}

            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>Minutes saved</Text>
            <TextInput
              accessibilityLabel="Minutes saved"
              keyboardType="number-pad"
              onChangeText={setTimeSaved}
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={styles.smallInput}
              value={timeSaved}
            />

            <Text style={styles.fieldLabel}>Steps removed</Text>
            <TextInput
              accessibilityLabel="Steps removed"
              keyboardType="number-pad"
              onChangeText={setStepsRemoved}
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={styles.smallInput}
              value={stepsRemoved}
            />

            <Text style={styles.fieldLabel}>Clarity gained</Text>
            <View style={styles.choiceRow}>
              {[1, 2, 3, 4, 5].map((score) => (
                <ChoiceChip
                  key={score}
                  label={String(score)}
                  selected={clarityGain === score}
                  onPress={() => setClarityGain(score)}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>Real output produced?</Text>
            <View style={styles.choiceRow}>
              <ChoiceChip
                label="Yes"
                selected={outputProduced === true}
                onPress={() => setOutputProduced(true)}
              />
              <ChoiceChip
                label="No"
                selected={outputProduced === false}
                onPress={() => setOutputProduced(false)}
              />
            </View>

            <Text style={styles.fieldLabel}>Would you use Zenzy again?</Text>
            <View style={styles.choiceRow}>
              <ChoiceChip
                label="Yes"
                selected={wouldUseAgain === true}
                onPress={() => setWouldUseAgain(true)}
              />
              <ChoiceChip
                label="No"
                selected={wouldUseAgain === false}
                onPress={() => setWouldUseAgain(false)}
              />
            </View>

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              accessibilityLabel="Review notes"
              multiline
              maxLength={1000}
              onChangeText={setNotes}
              placeholder="What changed? What still needs work?"
              placeholderTextColor={colors.muted}
              style={[styles.smallInput, styles.notesInput]}
              value={notes}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {activeIndex > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setError(null);
              setActiveIndex((current) => current - 1);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.primaryAction}>
          <PrimaryButton
            label={
              activeIndex === 4 ? 'Complete transformation' : 'Continue'
            }
            onPress={
              activeIndex === 4
                ? complete
                : () => setActiveIndex((current) => current + 1)
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kicker: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heading: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '900',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    minHeight: 390,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  strongBody: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  planItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 17,
    fontWeight: '800',
  },
  done: {
    color: colors.green,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  outputTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  outputBody: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 27,
  },
  successTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  successTagText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scheduleItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
  },
  scheduleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  duration: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  criterion: {
    color: colors.green,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  smallInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  error: {
    color: colors.red,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    minHeight: 54,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryAction: {
    flex: 1,
  },
});
