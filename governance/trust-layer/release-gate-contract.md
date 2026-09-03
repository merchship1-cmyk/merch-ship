# ZENZY Trust Layer - Release Gate Contract v1.0

## Canonical decision states
- RED: blocked; unsafe, unauthorized, unsupported, expired, or critical evidence missing.
- BLUE: build, correct, collect evidence, test, and validate. Not release-effective.
- GREEN: eligible for governed release only after all required gates pass.

## Effectiveness equation
Control claim + implementation record + operating evidence + completed test + reviewer approval = eligible effectiveness claim.

## Prohibited transitions
No control may skip lifecycle states. No object may move to EFFECTIVE or MONITORING without evidence, test, and reviewer approval.

## Framework claim boundary
- ISO/IEC 27001: SCOPED; not certified.
- SOC 2: NOT ASSESSED; no CPA examination or attestation.
- HIPAA: UNDETERMINED; applicability not established.
