# SYSTEM JUNGLE INDEX — Founder Cockpit v2.0

**Owner:** Ryan Richard Levack-Carr  
**Authority chain:** ZENZY PRIME CORE → ZENZY ARCHON → SJI Governance Controller → ZENZY FUSION ENGINE → Sync Machine  
**Locked:** 2026-07-30

## Canonical control decisions

- Higher SJI always means stronger verified capability.
- Complexity, Dependencies, Latency, and Load are scored as resilience/tolerance—not raw burden.
- `Gate` is the authoritative Notion formula; `Gate State` is the automation-maintained select mirror.
- First assessment rule: `Previous SJI = current SJI`.
- No test without granted authority and verified rollback.
- No release without verification and evidence.

## Score formula

`SJI = (Throughput + Complexity + Dependencies + Latency + Load + Autonomy + Recovery) / 7`

## Gates and lanes

| Gate | Range | Lane |
|---|---:|---|
| APEX | 4.50–5.00 | Scale |
| STRONG | 3.75–4.50 | Optimize |
| FRAGILE | 3.00–3.75 | Stabilize |
| WEAK | 1.50–3.00 | Repair |
| FAILURE | 0.00–1.50 | Rebuild |

## Runtime state machine

`DRAFT → REGISTERED → AWAITING AUTHORITY → APPROVED FOR TEST → TESTING → SCORING → EVIDENCE REVIEW → ROUTED → RECOVERY ACTIVE / VERIFYING → RELEASE DECISION → MONITORING`

Exception states: `INPUT REQUIRED`, `AUTHORITY DENIED`, `ROLLBACK REQUIRED`, `EVIDENCE INCOMPLETE`, `QUARANTINED`, `REBUILDING`.

## Sync Machine agents

### SJI-A01 — Intake Agent
**Trigger:** New System Jungle record created

**Ordered steps:**
1. Validate required identity fields.
2. If any field is missing, set Current State = INPUT REQUIRED and stop.
3. Otherwise set Current State = REGISTERED.
4. Create an unlocked Baseline Evidence Packet stub.
5. Write Assessment initialized to the audit log.

**Writes:** Current State, Evidence Packets, Pressure Notes

### SJI-A02 — Pressure Test Agent
**Trigger:** Test Approval changes to Approved

**Ordered steps:**
1. If authority is not granted, set Current State = AUTHORITY DENIED and stop.
2. If rollback is not verified, set Current State = ROLLBACK REQUIRED and stop.
3. Set Current State = TESTING and Test Status = Running.
4. Execute the Jungle Type pressure model.
5. Write Pressure Notes, metrics, and Failure Modes.
6. Set Test Status = Complete and Current State = SCORING.

**Writes:** Current State, Test Status, Pressure Notes, Failure Modes, Test Records

### SJI-A03 — Scoring Agent
**Trigger:** Test Status changes to Complete

**Ordered steps:**
1. Calculate the seven-vector SJI.
2. Calculate Capability Score and Evidence Confidence.
3. Load the previous verified SJI.
4. For a first assessment, set Previous SJI = current SJI.
5. Compute score delta, degradation drift, improvement gain, gate, and drift state.
6. Mirror Gate formula into Gate State select.
7. Set Current State = EVIDENCE REVIEW.

**Writes:** Previous SJI, Capability Score, Evidence Confidence, Gate State, Current State

### SJI-A04 — Drift Detection Agent
**Trigger:** SJI vectors updated and Previous SJI exists

**Ordered steps:**
1. Read Score Delta, Degradation Drift, and Improvement Gain.
2. Classify drift using locked thresholds.
3. Create a Drift record in SJI Drift & Escalation Registry.
4. If Stable, update Last Stable State to current SJI.

**Writes:** Drift & Escalation Records, Last Stable State

### SJI-A05 — Routing Agent
**Trigger:** Gate formula or Gate State changes

**Ordered steps:**
1. Map APEX to Scale.
2. Map STRONG to Optimize.
3. Map FRAGILE to Stabilize.
4. Map WEAK to Repair.
5. Map FAILURE to Rebuild.
6. Set Current State = ROUTED.

**Writes:** Lane, Current State

### SJI-A06 — Evidence Agent
**Trigger:** Evidence Packet Submitted = true

**Ordered steps:**
1. Check logs, metrics, screenshots, and recovery notes when required.
2. Assign Evidence Confidence 0-3.
3. If incomplete, set Current State = EVIDENCE INCOMPLETE and keep packet unlocked.
4. If complete, generate integrity hash, lock packet, and return system to EVIDENCE REVIEW or ROUTED.

**Writes:** Evidence Confidence, Current State, Evidence packet Locked, Integrity Hash

### SJI-A07 — Recovery Agent
**Trigger:** SJI < 3.0 OR Degradation Drift >= 0.10

**Ordered steps:**
1. Select the lane-specific playbook.
2. Generate one bounded, measurable, reversible action.
3. Assign owner and due date.
4. Create a Recovery Intervention record.
5. Set Recovery Status = Active and Current State = RECOVERY ACTIVE.

**Writes:** Recovery Records, Owner, Owner Action, Next Action, Recovery Status, Current State

### SJI-A08 — Escalation Agent
**Trigger:** SJI < 2.0 OR Degradation Drift >= 0.30

**Ordered steps:**
1. Set Permission State = Frozen.
2. Set Authority State = Escalated and Escalation State = Active.
3. Create an Escalation record and evidence packet.
4. If SJI < 1.5, set Quarantine State = Quarantined and Current State = QUARANTINED.

**Writes:** Permission State, Authority State, Escalation State, Quarantine State, Current State

### SJI-A09 — Failure Protocol Agent
**Trigger:** SJI < 1.5

**Ordered steps:**
1. Set Quarantine State = Quarantined.
2. Set Mutation Permission = Blocked and Permission State = Frozen.
3. Set Lane = Rebuild.
4. Set Current State = REBUILDING and Quarantine State = Rebuilding.
5. Require verified recovery before re-entry.

**Writes:** Quarantine State, Mutation Permission, Permission State, Lane, Current State

### SJI-A10 — Release Verification Agent
**Trigger:** Recovery Status = Complete AND verification requested

**Ordered steps:**
1. Compare baseline and post-intervention SJI.
2. Compare baseline and post-intervention Capability Score.
3. Validate Evidence Confidence against the release policy.
4. Issue RED when unsafe, unsupported, unauthorized, or unverified.
5. Issue BLUE when bounded operation is supported but scale is not verified.
6. Issue GREEN when evidence-backed capability is verified and safe to scale.
7. Create Verification / Release record and set Current State = MONITORING.

**Writes:** Verification & Release Records, Release Decision, Verification Status, Current State

## Notion implementation

- Master page: https://app.notion.com/p/3ad13e5cbb9f819982dfd36a356f77df
- Primary registry: https://app.notion.com/p/a6bd3c8de0f44939aa1ab9dbe2700030
- Evidence registry: https://app.notion.com/p/01856b195313467badf45cfd02d30027
- Test registry: https://app.notion.com/p/53a86b529d7a4d39a0c9736fdcf647c3
- Recovery registry: https://app.notion.com/p/60f8c649b08b4a8e937c13c02a8bf695
- Verification & Release registry: https://app.notion.com/p/40479dec6e504ca48e6177d6a84578e6
- Drift & Escalation registry: https://app.notion.com/p/fb855cb94c444fbea8853602708a815a
- Installation baseline: https://app.notion.com/p/3ad13e5cbb9f812e8b11e2790e73fb10

## Companion artifacts

- `sji-sync-machine-agents.yaml`
- `sji-n8n-workflow-spec.json`
- `sji-ghl-flow-spec.yaml`
- `sji-record.schema.json`
- Word implementation pack
