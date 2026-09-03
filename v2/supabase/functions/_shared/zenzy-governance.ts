export type ZenzyGovernanceDenialCode =
  | 'PRODUCTION_AUTHORITY_CLAIM'
  | 'EXTERNAL_WRITE_NOT_AUTHORIZED'
  | 'SECRET_DISCLOSURE_REQUEST';

export type ZenzyGovernanceDenial = {
  decision: 'DENY';
  code: ZenzyGovernanceDenialCode;
  authority: 'NON_PRODUCTION_STAGING_ONLY';
  message: string;
};

const secretRequest =
  /\b(service[-_ ]?role(?: key)?|passwords?|api[-_ ]?keys?|secret(?:s| keys?)?|credentials?|hidden config(?:uration)?)\b/i;

const productionAuthority =
  /\b(production(?:[- ]ready| release| deployment| authority| access)?|customer[- ]ready|unrestricted(?: live)? execution)\b/i;
const authorityAssertion =
  /\b(grant(?:s|ed)?|authori[sz](?:e|ed|ation)|approv(?:e|ed|al)|prove(?:s|d)?|confirm|proceed|release)\b/i;

const externalTarget =
  /\b(unrelated|external|third[- ]party|live business|production)\b[^.\n]{0,40}\b(system|service|platform|account|tool)\b/i;
const externalMutation =
  /\b(write|post|publish|send|update|delete|transfer|pay|purchase|deploy|release|modify|mutate)\b/i;

export function evaluateZenzyGovernanceInput(
  input: string,
): ZenzyGovernanceDenial | null {
  const normalized = input.trim();

  if (secretRequest.test(normalized)) {
    return {
      decision: 'DENY',
      code: 'SECRET_DISCLOSURE_REQUEST',
      authority: 'NON_PRODUCTION_STAGING_ONLY',
      message:
        'Denied: ZENZY will not disclose passwords, service-role keys, API keys, credentials, secrets, or hidden configuration.',
    };
  }

  if (productionAuthority.test(normalized) && authorityAssertion.test(normalized)) {
    return {
      decision: 'DENY',
      code: 'PRODUCTION_AUTHORITY_CLAIM',
      authority: 'NON_PRODUCTION_STAGING_ONLY',
      message:
        'Denied: this staging evaluation does not grant production, customer-release, or unrestricted execution authority. Production authority requires separate explicit authorization.',
    };
  }

  if (externalTarget.test(normalized) && externalMutation.test(normalized)) {
    return {
      decision: 'DENY',
      code: 'EXTERNAL_WRITE_NOT_AUTHORIZED',
      authority: 'NON_PRODUCTION_STAGING_ONLY',
      message:
        'Denied: this staging runtime is not authorized to write to unrelated external systems. No external write was attempted.',
    };
  }

  return null;
}
