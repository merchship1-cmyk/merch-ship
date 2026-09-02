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

import { useAuth } from '../auth/AuthProvider';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

export function AuthScreen() {
  const {
    configured,
    passwordRecoveryError,
    recoveringPassword,
    requestPasswordReset,
    signIn,
    signUp,
    updatePassword,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<
    'sign-in' | 'sign-up' | 'forgot-password'
  >('sign-in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (recoveringPassword) {
        await updatePassword(password);
      } else if (mode === 'forgot-password') {
        await requestPasswordReset(email);
        setMessage(
          'Recovery email sent. Open the newest link on this device.',
        );
      } else if (mode === 'sign-in') {
        await signIn(email, password);
      } else {
        const confirmationRequired = await signUp(email, password);
        if (confirmationRequired) {
          setMessage('Check your email to confirm the account, then sign in.');
          setMode('sign-in');
        }
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'Authentication could not be completed.',
      );
    } finally {
      setLoading(false);
    }
  };

  const formValid = recoveringPassword
    ? configured && password.length >= 6
    : mode === 'forgot-password'
      ? configured && email.trim().includes('@')
      : configured && email.trim().includes('@') && password.length >= 6;

  const title = recoveringPassword
    ? 'Create a new password'
    : mode === 'forgot-password'
      ? 'Reset your password'
      : mode === 'sign-in'
        ? 'Sign in to continue'
        : 'Create your account';

  const subtitle = recoveringPassword
    ? 'Enter a new password for this verified Supabase account.'
    : mode === 'forgot-password'
      ? 'Zenzy will email a secure link that returns to this app.'
      : 'Remote transformations are stored under your verified Supabase identity. Mock mode remains available without an account.';

  const submitLabel = recoveringPassword
    ? 'Save new password'
    : mode === 'forgot-password'
      ? 'Send recovery email'
      : mode === 'sign-in'
        ? 'Sign in'
        : 'Create account';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ZENZY · PROTECTED RUNTIME</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.form}>
          {!recoveringPassword ? (
            <TextInput
              testID="login-email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={email}
            />
          ) : null}
          {mode !== 'forgot-password' || recoveringPassword ? (
            <TextInput
              testID={recoveringPassword ? 'recovery-password' : 'login-password'}
              autoCapitalize="none"
              autoComplete={
                mode === 'sign-in' && !recoveringPassword
                  ? 'current-password'
                  : 'new-password'
              }
              onChangeText={setPassword}
              placeholder={recoveringPassword ? 'New password' : 'Password'}
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          ) : null}
        </View>

        {!configured ? (
          <Text style={styles.error}>
            Remote mode requires EXPO_PUBLIC_SUPABASE_URL and
            EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {passwordRecoveryError ? (
          <Text style={styles.error}>{passwordRecoveryError}</Text>
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <PrimaryButton
          testID={recoveringPassword ? 'recovery-submit' : 'login-submit'}
          label={submitLabel}
          loading={loading}
          disabled={!formValid}
          onPress={handleSubmit}
        />
        {!recoveringPassword ? (
          <>
            {mode === 'sign-in' ? (
              <Text
                accessibilityRole="button"
                onPress={() => {
                  setMode('forgot-password');
                  setError(null);
                  setMessage(null);
                }}
                style={styles.switchMode}
              >
                Forgot password?
              </Text>
            ) : null}
            <Text
              accessibilityRole="button"
              onPress={() => {
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
                setError(null);
                setMessage(null);
              }}
              style={styles.switchMode}
            >
              {mode === 'sign-in'
                ? 'Need an account? Create one'
                : 'Back to sign in'}
            </Text>
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heading: { gap: spacing.sm },
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
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  form: { gap: spacing.md },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
  },
  error: { color: colors.red, fontSize: 14, fontWeight: '600' },
  message: { color: colors.green, fontSize: 14, fontWeight: '600' },
  switchMode: {
    color: colors.blue,
    textAlign: 'center',
    fontWeight: '700',
    padding: spacing.sm,
  },
});
