import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VALIDATOR_PATH = ROOT / "scripts/pfu/validate_founder_communication_tier.py"
spec = importlib.util.spec_from_file_location("fgct_validator", VALIDATOR_PATH)
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


class FounderCommunicationTierTests(unittest.TestCase):
    def setUp(self):
        self.manifest = json.loads((ROOT / "manifests/pfu/founder-communication-tier.manifest.json").read_text())

    def test_manifest_preserves_identity_and_dormant_runtime(self):
        self.assertEqual([], validator.validate_manifest(self.manifest))
        self.assertEqual("PFU-FGCT-001", self.manifest["module_id"])
        self.assertEqual("DORMANT", self.manifest["runtime_state"])
        self.assertFalse(self.manifest["activation_boundary"]["runtime_activation"])

    def test_conceptual_claim_needs_no_physical_evidence(self):
        self.assertEqual([], validator.validate_claim("communication governance specification installed", set()))

    def test_background_claim_requires_worker_evidence(self):
        self.assertEqual(["background_worker_evidence"], validator.validate_claim("background continuation is active", set()))

    def test_merge_deploy_release_claims_require_evidence(self):
        missing = validator.validate_claim("merged, deployed and released", set())
        self.assertEqual(["deployment_evidence", "merge_evidence", "release_evidence"], missing)

    def test_physical_claim_passes_with_named_evidence(self):
        evidence = {"merge_evidence", "deployment_evidence", "release_evidence"}
        self.assertEqual([], validator.validate_claim("merged, deployed and released", evidence))


if __name__ == "__main__":
    unittest.main()
