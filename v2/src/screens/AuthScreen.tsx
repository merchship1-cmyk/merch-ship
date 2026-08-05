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
  const { configured, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'sign-in') {
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

  const formValid =
    configured && email.trim().includes('@') && password.length >= 6;

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
          <Text style={styles.title}>
            {mode === 'sign-in' ? 'Sign in to continue' : 'Create your account'}
          </Text>
          <Text style={styles.subtitle}>
            Remote transformations are stored under your verified Supabase
            identity. Mock mode remains available without an account.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {!configured ? (
          <Text style={styles.error}>
            Remote mode requires EXPO_PUBLIC_SUPABASE_URL and
            EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <PrimaryButton
          label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
          loading={loading}
          disabled={!formValid}
          onPress={handleSubmit}
        />
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
            : 'Already have an account? Sign in'}
        </Text>
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
