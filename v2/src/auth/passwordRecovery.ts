export const passwordRecoveryRedirectUrl = 'zenzy://auth/reset-password';

export type PasswordRecoverySession = {
  accessToken: string;
  refreshToken: string;
};

export function parsePasswordRecoveryUrl(
  url: string | null,
): PasswordRecoverySession | null {
  if (!url || !url.startsWith(passwordRecoveryRedirectUrl)) {
    return null;
  }

  const fragmentIndex = url.indexOf('#');
  if (fragmentIndex < 0) {
    return null;
  }

  const params = new URLSearchParams(url.slice(fragmentIndex + 1));
  if (params.get('type') !== 'recovery') {
    return null;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}
