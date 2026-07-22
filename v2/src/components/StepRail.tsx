import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

const steps = ['IDEA', 'PLAN', 'CREATE', 'SCHEDULE', 'REVIEW'];

export function StepRail({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.rail}>
      {steps.map((step, index) => (
        <View key={step} style={styles.item}>
          <View
            style={[
              styles.dot,
              index <= activeIndex && styles.dotActive,
              index < activeIndex && styles.dotComplete,
            ]}
          />
          <Text
            style={[
              styles.label,
              index === activeIndex && styles.labelActive,
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.blue,
  },
  dotComplete: {
    backgroundColor: colors.green,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  labelActive: {
    color: colors.text,
  },
});
