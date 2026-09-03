# ZENZY Phase 1B-FST — Founder Smoke Test

Status: GREEN
Lifecycle: Phase 1B pre-release / internal evidence only
Initial baseline: `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`
Required mode: `EXPO_PUBLIC_ZENZY_AI_MODE=mock`
Production deployment: NOT AUTHORIZED
RFTO / PRIME / BMOS: NOT AUTHORIZED

## Test record

- Tester: Ryan Levack-Carr (Founder)
- Date/time: 2026-09-03, approximately 02:14–02:49 local time
- Source SHA: `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`
- Windows host: Founder Windows host used through the governed launcher; exact host identifier not retained in this record
- Android device / OS: Founder Android device; exact model/OS not retained in this record
- Expo client/runtime: Expo session launched by the governed Founder launcher; exact client version not retained in this record
- Result: GREEN — all defined Founder smoke gates exercised; no blocking defect observed; two non-blocking defects retained

## Runtime reconstruction evidence

The governed launcher for this test:

- hard-targets source SHA `8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c`;
- stops unless Node.js major version is 22;
- forces `EXPO_PUBLIC_ZENZY_AI_MODE=mock`;
- clears production API, Supabase, preview, and EAS runtime values for the local session;
- runs `npm ci`;
- runs the Android Expo bundle check; and
- starts Expo only after those controls pass.

The Founder reached the running Android application through this lane and the visible outcome screen explicitly reported that MOCK mode keeps proof local for development.

## Gates

| Gate | Category | Result | Notes / evidence |
| --- | --- | --- | --- |
| FST-01 | Deterministic source + runtime reconstruction | PASS | Governed launcher reached Expo runtime from exact baseline; launcher enforces Node 22, `npm ci`, Android bundle check, MOCK mode, and cleared production runtime values before start. |
| FST-02 | Initial render | PASS | Start, clarity, execution, review, and outcome screens rendered without blank/red screen. |
| FST-03 | Layout + visual hierarchy | PASS | Founder screenshots show readable hierarchy, controls, cards, and text without observed clipping or overlap on the tested Android device. |
| FST-04 | Navigation + Android back behavior | FAIL-NONBLOCKING | In-app forward/back navigation worked. Android system Back exited the app from PLAN rather than stepping PLAN → IDEA; reopening restored the same PLAN state with no run loss. |
| FST-05 | Input handling + validation | PASS | Empty input stayed disabled; 2-character `ab` stayed disabled; 3-character `abc` enabled submit; required REVIEW evidence validation blocked incomplete completion; materially long input entered and edited successfully; Android keyboard dismissed with system Back while ZENZY stayed open, edited text persisted, and submit remained available. |
| FST-06 | Clarity screen | PASS | Clarity hierarchy, plan, result preview, Accept next move, and Change the input were visible and reachable. MOCK output remained intentionally deterministic/generic. |
| FST-07 | Acceptance flow | PASS | Change the input rejected the direction and returned to start; Accept next move advanced into execution; no repeated-state trap observed. |
| FST-08 | Scrolling + long content | PASS | PLAN, SCHEDULE, and REVIEW content scrolled to bottom controls; long content remained reachable. |
| FST-09 | Error surfaces | FAIL-NONBLOCKING | No crash/red screen/freeze observed. Incomplete REVIEW submission correctly showed `Record all five transformation measures to finish.` During long-input editing, Expo displayed a visible `SafeAreaView has been deprecated...` development warning; app remained usable. |

Allowed result values: `PASS`, `FAIL-BLOCKING`, `FAIL-NONBLOCKING`, `NOT-APPLICABLE`.

## Founder core-path evidence

Observed end-to-end path:

`START → CLARITY → REJECT → START → CLARITY → ACCEPT → IDEA → PLAN → CREATE → SCHEDULE → REVIEW → OUTCOME`

Final evidence values recorded in the successful completion run:

- time saved: `10` minutes
- steps removed: `1`
- clarity gained: `3/5`
- real output produced: `Yes`
- would use Zenzy again: `Yes`
- notes: blank / optional

Additional input/keyboard test:

- materially long multi-sentence input entered successfully;
- input remained editable;
- Founder replaced `complicated` with `Large` successfully;
- text remained visible with the Android keyboard open;
- Android system Back dismissed the keyboard without leaving ZENZY;
- edited text remained present after keyboard dismissal;
- `Build my next move` remained available;
- a SafeAreaView deprecation warning surfaced but did not block editing or keyboard interaction.

Screenshots were captured throughout the Founder session and retained in the Founder test conversation. No screenshot is represented here as repository-retained evidence until it is separately attached to an authorized evidence surface.

## Defect register

| Defect ID | Gate | Severity | Observation | Screenshot / evidence | Resolution SHA | Retest |
| --- | --- | --- | --- | --- | --- | --- |
| FST-04-001 | FST-04 | NONBLOCKING | Android system Back exits the app from PLAN instead of stepping backward inside ZENZY. Reopening restores the same PLAN state, with no crash or transformation loss. | Founder observation + screenshots, 2026-09-03 ~02:25 local | OPEN | Recovery PASS; navigation behavior not fixed |
| FST-09-001 | FST-09 | NONBLOCKING | Expo surfaced a `SafeAreaView has been deprecated...` development warning while editing a long input. The app remained interactive and no crash/red screen occurred. | Founder screenshot, 2026-09-03 ~02:49 local | OPEN | Usability/keyboard interaction PASS; warning not remediated |

## FST GREEN decision

`1B-FST: GREEN`

Rationale:

1. tested source SHA is unambiguous;
2. MOCK mode is confirmed;
3. app opens successfully;
4. reachable core navigation operates;
5. clarity and acceptance behavior are human-visible and testable;
6. input, editing, long-content, keyboard-dismiss, validation, execution, review, and completion paths were exercised;
7. no unresolved blocking crash/runtime/UI defect remains; and
8. both observed non-blocking defects are explicitly retained above.

The non-blocking defects remain open for the controlled fix lane or a later governed UX increment. They do not invalidate this smoke-test GREEN classification under the defined no-blocking-defect rule.

`FST GREEN` is a smoke-test result only. It is not production release, RFTO certification, PRIME inheritance, BMOS attachment, broader ZENZY admission, or authority transfer.
