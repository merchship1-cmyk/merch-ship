import { describe, expect, it } from 'vitest';

import {
  parsePasswordRecoveryUrl,
  passwordRecoveryRedirectUrl,
} from './passwordRecovery';

describe('password recovery links', () => {
  it('accepts a complete recovery callback for the Zenzy scheme', () => {
    expect(
      parsePasswordRecoveryUrl(
        `${passwordRecoveryRedirectUrl}#access_token=test-access&refresh_token=test-refresh&type=recovery`,
      ),
    ).toEqual({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
    });
  });

  it.each([
    null,
    'https://example.com/reset#access_token=a&refresh_token=r&type=recovery',
    `${passwordRecoveryRedirectUrl}#access_token=a&refresh_token=r&type=signup`,
    `${passwordRecoveryRedirectUrl}#access_token=a&type=recovery`,
  ])('rejects a callback that is outside the recovery contract', (url) => {
    expect(parsePasswordRecoveryUrl(url)).toBeNull();
  });
});
