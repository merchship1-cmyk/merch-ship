import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState, Linking } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  parsePasswordRecoveryUrl,
  passwordRecoveryRedirectUrl,
} from './passwordRecovery';

type AuthContextValue = {
  configured: boolean;
  passwordRecoveryError: string | null;
  ready: boolean;
  recoveringPassword: boolean;
  session: Session | null;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const requireClient = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured for remote mode.');
  }

  return supabase;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const [passwordRecoveryError, setPasswordRecoveryError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setReady(true);
      return;
    }

    let active = true;
    const handleRecoveryUrl = async (url: string | null) => {
      const recoverySession = parsePasswordRecoveryUrl(url);
      if (!recoverySession) {
        return false;
      }

      const { data, error } = await client.auth.setSession({
        access_token: recoverySession.accessToken,
        refresh_token: recoverySession.refreshToken,
      });

      if (!active) {
        return true;
      }

      if (error) {
        setPasswordRecoveryError(
          'This recovery link is invalid or expired. Request a new email.',
        );
        setRecoveringPassword(false);
        setReady(true);
        return true;
      }

      setPasswordRecoveryError(null);
      setSession(data.session);
      setRecoveringPassword(true);
      setReady(true);
      return true;
    };

    void Linking.getInitialURL()
      .then(async (url) => {
        if (await handleRecoveryUrl(url)) {
          return;
        }

        const { data, error } = await client.auth.getSession();
        if (!active) {
          return;
        }

        if (error) {
          console.warn('Unable to restore the Supabase session.');
        }
        setSession(data.session ?? null);
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setPasswordRecoveryError('Zenzy could not open the recovery link.');
          setReady(true);
        }
      });

    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      void handleRecoveryUrl(url);
    });

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) {
          setSession(nextSession);
          setReady(true);
        }
      },
    );

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });

    client.auth.startAutoRefresh();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      linkingListener.remove();
      appStateListener.remove();
      client.auth.stopAutoRefresh();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      passwordRecoveryError,
      ready,
      recoveringPassword,
      session,
      async requestPasswordReset(email) {
        const { error } = await requireClient().auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: passwordRecoveryRedirectUrl },
        );
        if (error) {
          throw new Error(error.message);
        }
      },
      async updatePassword(password) {
        const { error } = await requireClient().auth.updateUser({ password });
        if (error) {
          throw new Error(error.message);
        }
        setPasswordRecoveryError(null);
        setRecoveringPassword(false);
      },
      async signIn(email, password) {
        const { error } = await requireClient().auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          throw new Error(error.message);
        }
      },
      async signUp(email, password) {
        const { data, error } = await requireClient().auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) {
          throw new Error(error.message);
        }
        return data.session === null;
      },
      async signOut() {
        const { error } = await requireClient().auth.signOut();
        if (error) {
          throw new Error(error.message);
        }
      },
    }),
    [passwordRecoveryError, ready, recoveringPassword, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
