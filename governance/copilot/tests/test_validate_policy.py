from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "validate_policy.py"
SPEC = importlib.util.spec_from_file_location("validate_policy", MODULE_PATH)
assert SPEC and SPEC.loader
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


class ResolutionContractTests(unittest.TestCase):
    def test_enterprise_disabled_is_hard_deny(self) -> None:
        decision = VALIDATOR.resolve_model_access(
            enterprise_state="disabled",
            teams_mode_enabled=True,
            team_grants=(True,),
        )
        self.assertEqual(decision, "deny")

    def test_enterprise_enabled_is_baseline_allow(self) -> None:
        decision = VALIDATOR.resolve_model_access(
            enterprise_state="enabled",
            teams_mode_enabled=False,
        )
        self.assertEqual(decision, "allow")

    def test_optional_is_organization_controlled_outside_teams_mode(self) -> None:
        enabled = VALIDATOR.resolve_model_access(
            enterprise_state="optional",
            teams_mode_enabled=False,
            organization_state="enabled",
        )
        disabled = VALIDATOR.resolve_model_access(
            enterprise_state="optional",
            teams_mode_enabled=False,
            organization_state="disabled",
        )
        self.assertEqual(enabled, "allow")
        self.assertEqual(disabled, "deny")

    def test_optional_uses_additive_team_union_in_teams_mode(self) -> None:
        granted = VALIDATOR.resolve_model_access(
            enterprise_state="optional",
            teams_mode_enabled=True,
            team_grants=(False, True, False),
        )
        not_granted = VALIDATOR.resolve_model_access(
            enterprise_state="optional",
            teams_mode_enabled=True,
            team_grants=(False, False),
        )
        self.assertEqual(granted, "allow")
        self.assertEqual(not_granted, "deny")

    def test_unconfigured_uses_default_policy_outside_teams_mode(self) -> None:
        enabled = VALIDATOR.resolve_model_access(
            enterprise_state="unconfigured",
            teams_mode_enabled=False,
            default_availability="enabled",
        )
        disabled = VALIDATOR.resolve_model_access(
            enterprise_state="unconfigured",
            teams_mode_enabled=False,
            default_availability="disabled",
        )
        self.assertEqual(enabled, "allow")
        self.assertEqual(disabled, "deny")

    def test_unconfigured_is_unavailable_in_teams_mode(self) -> None:
        decision = VALIDATOR.resolve_model_access(
            enterprise_state="unconfigured",
            teams_mode_enabled=True,
            default_availability="enabled",
        )
        self.assertEqual(decision, "deny")

    def test_multiple_license_sources_stop_external_routing(self) -> None:
        decision = VALIDATOR.resolve_model_access(
            enterprise_state="enabled",
            teams_mode_enabled=False,
            multiple_license_sources=True,
        )
        self.assertEqual(decision, "explicit_external_resolution_required")


if __name__ == "__main__":
    unittest.main()
