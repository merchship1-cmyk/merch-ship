import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import type { DashboardSnapshot } from '../domain/dashboard';
import { colors, spacing } from '../theme';

type Props = {
  snapshot: DashboardSnapshot;
  onContinue: () => void;
};

export function DashboardScreen({ snapshot, onContinue }: Props) {
  const cards = [
    { label: 'NOW', value: snapshot.now },
    { label: 'NEXT', value: snapshot.next },
    { label: 'LATER', value: snapshot.later },
    { label: 'BLOCKED', value: snapshot.blocked },
    { label: 'DONE', value: snapshot.done },
  ];

  return (
    <ScrollView
      testID="zenzy-dashboard"
      contentContainerStyle={styles.container}
    >
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>ZENZY · HOME</Text>
      </View>

      <View style={styles.heading}>
        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text style={styles.title}>Here is where you left off.</Text>
        <Text style={styles.subtitle}>
          You should not have to remember the whole system before you can keep
          moving.
        </Text>
      </View>

      <View style={styles.understandingCard}>
        <Text style={styles.cardLabel}>CURRENT UNDERSTANDING</Text>
        <Text style={styles.understandingText}>
          {snapshot.currentUnderstanding}
        </Text>
      </View>

      <PrimaryButton
        testID="dashboard-continue"
        label={snapshot.stage === 'start' ? 'Start here' : 'Continue where I left off'}
        onPress={onContinue}
      />

      <View style={styles.statusStack}>
        {cards.map((card) => (
          <View key={card.label} style={styles.statusCard}>
            <Text
              style={[
                styles.cardLabel,
                card.label === 'BLOCKED' &&
                snapshot.blocked !== 'Nothing blocked right now.'
                  ? styles.blockedLabel
                  : null,
              ]}
            >
              {card.label}
            </Text>
            <Text style={styles.statusText}>{card.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.savedText}>
        Saved {new Date(snapshot.updatedAt).toLocaleString()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
  },
  understandingCard: {
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.blueSoft,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  blockedLabel: {
    color: colors.red,
  },
  understandingText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
  },
  statusStack: {
    gap: spacing.sm,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statusText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  savedText: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
