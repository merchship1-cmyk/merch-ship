import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import {
  createDashboardSnapshot,
  markDashboardBlocked,
  type DashboardSnapshot,
} from './src/domain/dashboard';
import type {
  TransformationAcceptance,
  TransformationEvidence,
  TransformationResult,
} from './src/domain/transformation';
import { AuthScreen } from './src/screens/AuthScreen';
import { ClarityAcceptanceScreen } from './src/screens/ClarityAcceptanceScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OutcomeScreen } from './src/screens/OutcomeScreen';
import { StartScreen } from './src/screens/StartScreen';
import { TransformationScreen } from './src/screens/TransformationScreen';
import {
  loadDashboardSnapshot,
  saveDashboardSnapshot,
} from './src/services/dashboardStore';
import {
  acceptTransformation,
  recordTransformationEvidence,
} from './src/services/phase1aClient';
import {
  isRemoteMode,
  runTransformation,
} from './src/services/transformationClient';
import { colors, spacing } from './src/theme';

function ZenzyApp() {
  const auth = useAuth();
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [acceptance, setAcceptance] =
    useState<TransformationAcceptance | null>(null);
  const [evidence, setEvidence] = useState<TransformationEvidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [dashboardHydrated, setDashboardHydrated] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardSnapshot>(() =>
    createDashboardSnapshot('start'),
  );

  const dashboardOwnerKey = isRemoteMode
    ? (auth.session?.user.id ?? null)
    : 'local-preview';

  useEffect(() => {
    setResult(null);
    setAcceptance(null);
    setEvidence(null);
    setError(null);
    setShowDashboard(true);
  }, [auth.session?.user.id]);

  useEffect(() => {
    if (isRemoteMode && (!auth.ready || !auth.configured || !auth.session)) {
      setDashboardHydrated(false);
      return;
    }

    if (!dashboardOwnerKey) return;

    let cancelled = false;
    setDashboardHydrated(false);

    void loadDashboardSnapshot(dashboardOwnerKey)
      .then((saved) => {
        if (cancelled) return;
        setDashboard(saved ?? createDashboardSnapshot('start'));
        setDashboardHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setDashboard(createDashboardSnapshot('start'));
        setDashboardHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.configured, auth.ready, auth.session?.user.id, dashboardOwnerKey]);

  useEffect(() => {
    if (!dashboardHydrated || !dashboardOwnerKey) return;

    void saveDashboardSnapshot(dashboardOwnerKey, dashboard).catch(() => {
      // Dashboard memory must never block the core transformation flow.
    });
  }, [dashboard, dashboardHydrated, dashboardOwnerKey]);

  const handleStart = async (input: string) => {
    setLoading(true);
    setError(null);
    setAcceptance(null);
    setEvidence(null);

    try {
      const nextResult = await runTransformation(input);
      setResult(nextResult);
      setDashboard(createDashboardSnapshot('clarity'));
      setShowDashboard(false);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Zenzy could not build this transformation yet.';
      setError(message);
      setDashboard((current) => markDashboardBlocked(current, message));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!result) return;

    setLoading(true);
    setError(null);
    try {
      const nextAcceptance = await acceptTransformation(result.id);
      setAcceptance(nextAcceptance);
      setDashboard(createDashboardSnapshot('execution'));
    } catch (acceptanceError) {
      const message =
        acceptanceError instanceof Error
          ? acceptanceError.message
          : 'Zenzy could not store this acceptance.';
      setError(message);
      setDashboard((current) => markDashboardBlocked(current, message));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEvidence = async (candidate: TransformationEvidence) => {
    setLoading(true);
    setError(null);
    try {
      const nextEvidence = await recordTransformationEvidence(candidate);
      setEvidence(nextEvidence);
      setDashboard(createDashboardSnapshot('outcome'));
    } catch (evidenceError) {
      const message =
        evidenceError instanceof Error
          ? evidenceError.message
          : 'Zenzy could not store this evidence.';
      setError(message);
      setDashboard((current) => markDashboardBlocked(current, message));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDirection = () => {
    const nextDashboard = createDashboardSnapshot('start');
    setResult(null);
    setAcceptance(null);
    setEvidence(null);
    setError(null);
    setDashboard({
      ...nextDashboard,
      currentUnderstanding:
        'The previous direction did not fit, so it was rejected instead of being executed. Zenzy is ready for a clearer starting point.',
      done: 'A direction was rejected before execution because it did not fit.',
    });
  };

  const handleReset = () => {
    const nextDashboard = createDashboardSnapshot('start');
    setResult(null);
    setAcceptance(null);
    setEvidence(null);
    setError(null);
    setDashboard({
      ...nextDashboard,
      currentUnderstanding:
        'Your previous transformation is complete. Zenzy is ready to carry that sense of progress into the next useful piece of work.',
      done: 'The previous transformation completed with outcome evidence.',
    });
    setShowDashboard(true);
  };

  if (isRemoteMode && !auth.ready) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.green} size="large" />
      </SafeAreaView>
    );
  }

  if (
    isRemoteMode &&
    (!auth.configured || !auth.session || auth.recoveringPassword)
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  if (!dashboardHydrated) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.green} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.controlBar}>
        {!showDashboard ? (
          <Pressable
            accessibilityRole="button"
            testID="open-dashboard"
            onPress={() => setShowDashboard(true)}
          >
            <Text style={styles.homeLink}>Home</Text>
          </Pressable>
        ) : (
          <Text style={styles.homeLabel}>ZENZY</Text>
        )}

        {isRemoteMode && auth.session ? (
          <>
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
          </>
        ) : (
          <View style={styles.barSpacer} />
        )}
      </View>

      <View style={styles.content}>
        {showDashboard ? (
          <DashboardScreen
            snapshot={dashboard}
            loading={loading}
            error={error}
            remoteAuthenticated={isRemoteMode}
            canContinue={result !== null}
            onStart={handleStart}
            onContinue={() => setShowDashboard(false)}
          />
        ) : !result ? (
          <StartScreen
            loading={loading}
            error={error}
            remoteAuthenticated={isRemoteMode}
            onStart={handleStart}
          />
        ) : !acceptance ? (
          <ClarityAcceptanceScreen
            result={result}
            loading={loading}
            error={error}
            onAccept={handleAccept}
            onReject={handleRejectDirection}
          />
        ) : evidence ? (
          <OutcomeScreen
            result={result}
            evidence={evidence}
            onReset={handleReset}
          />
        ) : (
          <TransformationScreen
            result={result}
            submitting={loading}
            submitError={error}
            onComplete={handleCompleteEvidence}
          />
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
  controlBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'android' ? spacing.lg : 0,
  },
  homeLink: { color: colors.blue, fontWeight: '900' },
  homeLabel: { color: colors.text, fontSize: 12, fontWeight: '900' },
  barSpacer: { flex: 1 },
  sessionEmail: { flex: 1, color: colors.muted, fontSize: 12 },
  signOut: { color: colors.blue, fontWeight: '800' },
});
