# ZENZY Phase 1B-FST — Founder Smoke Test

Status: PENDING
Lifecycle: Phase 1B pre-release / internal evidence only
Initial baseline: `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`
Required mode: `EXPO_PUBLIC_ZENZY_AI_MODE=mock`
Production deployment: NOT AUTHORIZED
RFTO / PRIME / BMOS: NOT AUTHORIZED

## Test record

- Tester:
- Date/time:
- Source SHA:
- Windows host:
- Android device / OS:
- Expo client/runtime:
- Result: PENDING

## Gates

| Gate | Category | Result | Notes / evidence |
| --- | --- | --- | --- |
| FST-01 | Deterministic source + runtime reconstruction | PENDING | Confirm source SHA, `npm ci`, bundle check, Expo start |
| FST-02 | Initial render | PENDING | No blank/red screen; primary UI visible |
| FST-03 | Layout + visual hierarchy | PENDING | Readability, spacing, clipping, overlap, control visibility |
| FST-04 | Navigation + Android back behavior | PENDING | Forward/back paths, no traps or broken stack behavior |
| FST-05 | Input handling + validation | PENDING | Valid, empty, short, long, edit, keyboard behavior |
| FST-06 | Clarity screen | PENDING | Messaging, hierarchy, actions, state behavior |
| FST-07 | Acceptance flow | PENDING | Accept/reject/repeated interaction; correct next state |
| FST-08 | Scrolling + long content | PENDING | Reachability, nested scrolling, bottom controls |
| FST-09 | Error surfaces | PENDING | Crashes, red screens, warnings, freezes, broken routes |

Allowed result values: `PASS`, `FAIL-BLOCKING`, `FAIL-NONBLOCKING`, `NOT-APPLICABLE`.

## Defect register

| Defect ID | Gate | Severity | Observation | Screenshot / evidence | Resolution SHA | Retest |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

## FST GREEN rule

Phase 1B-FST is GREEN only when:

1. the tested source SHA is unambiguous;
2. MOCK mode is confirmed;
3. the app opens successfully;
4. reachable core navigation operates;
5. clarity and acceptance behavior are human-visible and testable;
6. no unresolved blocking crash/runtime/UI defect remains; and
7. observations and defects are recorded above.

`FST GREEN` is a smoke-test result only. It is not production release, RFTO certification, PRIME inheritance, BMOS attachment, broader ZENZY admission, or authority transfer.
