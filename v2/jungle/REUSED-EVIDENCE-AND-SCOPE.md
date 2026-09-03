# ZENZY JUNGLE Progressive Pressure — Evidence Reuse and Scope

Status: TEST-ONLY / NON-PRODUCTION / NO MERGE AUTHORITY

Current subject SHA: `eaa2d65550eed1f4f95b52c151c2c0610ce35241`
Frozen prior subject SHA: `d6d7aa7f29bc3dc3a689bcd3712e1decd612ae3b`
Frozen branch head: `645e78a9e5ffec52d2d0d3f0d87095aafa5eb18e`
Staging project: `dlliijieyppljpxbweib`

## Reused retained evidence — do not rerun equivalent cases

| Test | Retained workflow run | Retained artifact | SHA-256 digest | Covered cases |
|---|---:|---:|---|---|
| ZJ-T-005 | `33752373986` | `9892070531` | `a47e39cab34cae825e801e105e088f8a6387414b060459d28320208656e283ad` | JZ-011–JZ-014 |
| ZJ-T-006 | `33752568785` | `9892128468` | `2390193167056b88b305ae6ace627b2b1875b12c13c3cecd676a14308f99a616` | JZ-018 malformed/input validation batch |
| ZJ-T-007 | `33752747258` | `9892214703` | `4e7803260b526afb6044634dd75ecd6ff4c58a05857a8deedbd417e02be0dfca` | JZ-020, JZ-021, JZ-024 |
| ZJ-T-008 | `33753461306` | `9892506846` | `c19664baef30a17c50989a0d99bf0e5342fd36678963306fd56bfe4a7997754a` | JZ-015, JZ-016, JZ-017, JZ-019, JZ-022, JZ-023 |

The prior FAIL, PARTIAL, BLOCKED, INVALID, and PASS outcomes remain preserved as originally observed. This progressive lane does not rewrite them.

## New progressive work only

1. Progressive concurrency pressure: `1 -> 2 -> 5 -> 10 -> 20`, stopping before the next level if a stage fails.
2. Stronger empirical cross-user isolation pressure across the newly generated load set, including opposite-user reads and bounded opposite-user acceptance attempts.
3. Previously unexercised request boundaries only: non-object JSON forms, empty object, non-string input, exact two-character lower-bound rejection, exact three-character acceptance, exact 4,000-character governance-denial path, ownership-spoof fields, and 1,000/1,001-character evidence-notes boundary.
4. Bounded duplicate mutation/retry checks using existing acceptance/evidence idempotency surfaces.
5. Persisted-state interruption recovery via fresh authentication; no worker-lease result is fabricated when no lease surface exists.
6. Resource ceilings: maximum 39 provider-generating requests, maximum concurrency 20, 120-second request timeout, zero automatic provider retries by the harness, and stop-on-failed-stage behavior.
7. Direct provider monetary/token cost is not invented when the runtime does not expose usage telemetry.
8. Complete recovery-audit record for the new pressure run, linked to the retained frozen evidence.

## Runtime mutation boundary

Allowed by this test lane:
- dedicated staging test-user transformation rows;
- staging acceptance rows;
- staging evidence rows;
- local/GitHub retained test evidence.

Not allowed:
- edits to app/runtime/Edge Function code;
- database migrations;
- deployment or release;
- production/customer data;
- external business-system writes;
- merge;
- production authority, RFTO, PRIME/BMOS, or other authority expansion.

If the progressive test exposes a runtime defect, the test lane stops and records the defect. Runtime remediation must occur through a separate normal governed remediation path.
