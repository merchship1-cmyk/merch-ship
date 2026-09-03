#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "manifests/pfu/founder-communication-tier.manifest.json"

PHYSICAL_CLAIM_TERMS = {
    "background continuation": "background_worker_evidence",
    "autonomous execution": "runtime_execution_evidence",
    "runtime active": "runtime_execution_evidence",
    "merged": "merge_evidence",
    "deployed": "deployment_evidence",
    "released": "release_evidence",
}


def load_manifest():
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def validate_manifest(data):
    errors = []
    if data.get("module_id") != "PFU-FGCT-001": errors.append("module_id must be PFU-FGCT-001")
    if data.get("version") != "1.0.0": errors.append("version must be 1.0.0")
    if data.get("release_state") != "BLUE": errors.append("release_state must remain BLUE")
    if data.get("runtime_state") != "DORMANT": errors.append("runtime_state must remain DORMANT")
    boundary = data.get("activation_boundary", {})
    if boundary.get("runtime_activation") is not False: errors.append("runtime_activation must be false")
    if boundary.get("external_message_dispatch") is not False: errors.append("external_message_dispatch must be false")
    if len(data.get("communication_truth_rules", [])) < 7: errors.append("seven communication truth rules are required")
    evidence = data.get("evidence", {})
    if evidence.get("installation_state") != "SSOT_INSTALLED_BLUE": errors.append("installation_state must remain SSOT_INSTALLED_BLUE")
    if evidence.get("runtime_evidence_required_for_physical_claims") is not True: errors.append("physical claims must require runtime evidence")
    return errors


def validate_claim(claim, evidence_keys):
    lowered = claim.lower()
    missing = []
    for term, evidence_key in PHYSICAL_CLAIM_TERMS.items():
        if term in lowered and evidence_key not in evidence_keys:
            missing.append(evidence_key)
    return sorted(set(missing))


def main(argv):
    data = load_manifest()
    errors = validate_manifest(data)
    if len(argv) > 1:
        evidence_keys = set(argv[2:])
        missing = validate_claim(argv[1], evidence_keys)
        errors.extend(f"claim requires evidence: {key}" for key in missing)
    if errors:
        for error in errors: print(f"FAIL: {error}")
        return 1
    print("PASS: PFU-FGCT-001 manifest and claim boundary valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
