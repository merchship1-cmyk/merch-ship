import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceChip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 48,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.blue,
    backgroundColor: colors.blueSoft,
  },
  label: {
    color: colors.muted,
    fontWeight: '700',
  },
  selectedLabel: {
    color: colors.text,
  },
});
