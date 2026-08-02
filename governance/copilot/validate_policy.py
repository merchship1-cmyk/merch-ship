from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent
VALID_MODEL_STATES = {"enabled", "disabled", "optional", "unconfigured"}
VALID_OBSERVED_STATES = {"enabled", "disabled", "limited", "review_required", "unverified"}
VALID_ACCESS_MODES = {"baseline_only", "optional_grants", "frontier_review"}
EXPECTED_SURFACES = {"ide", "copilot_cli", "github_web", "github_mobile", "copilot_app"}
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
CANONICAL_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/-]*$")


def resolve_model_access(
    *,
    enterprise_state: str,
    teams_mode_enabled: bool,
    organization_state: str = "unconfigured",
    team_grants: tuple[bool, ...] = (),
    default_availability: str = "disabled",
    multiple_license_sources: bool = False,
) -> str:
    """Return the PFU routing decision after modeling GitHub-native access."""
    if multiple_license_sources:
        return "explicit_external_resolution_required"
    if enterprise_state == "disabled":
        return "deny"
    if enterprise_state == "enabled":
        return "allow"
    if enterprise_state == "optional":
        if teams_mode_enabled:
            return "allow" if any(team_grants) else "deny"
        if organization_state == "enabled":
            return "allow"
        if organization_state == "disabled":
            return "deny"
        return "allow" if default_availability == "enabled" else "deny"
    if enterprise_state == "unconfigured":
        if teams_mode_enabled:
            return "deny"
        return "allow" if default_availability == "enabled" else "deny"
    raise ValueError(f"unknown enterprise model state: {enterprise_state}")


def load_yaml(path: Path, errors: list[str]) -> dict[str, Any]:
    relative = str(path.relative_to(ROOT))
    try:
        value = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{relative}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{relative}: top-level YAML value must be a mapping")
        return {}
    if value.get("schema_version") != 1:
        errors.append(f"{relative}: schema_version must be 1")
    return value


def nonempty(value: Any) -> bool:
    return value not in (None, "", [], {})


def add_block(blocks: list[str], condition: bool, message: str) -> None:
    if condition:
        blocks.append(message)


def parse_time(value: Any, label: str, blocks: list[str]) -> datetime | None:
    if not isinstance(value, str) or not value:
        blocks.append(f"{label} is required")
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        blocks.append(f"{label} must be an ISO-8601 timestamp")
        return None
    if parsed.tzinfo is None:
        blocks.append(f"{label} must include a timezone")
        return None
    return parsed.astimezone(timezone.utc)


def unique_registry_entries(
    entries: list[dict[str, Any]],
    *,
    label: str,
    errors: list[str],
) -> dict[str, dict[str, Any]]:
    indexed: dict[str, dict[str, Any]] = {}
    for entry in entries:
        entry_id = entry.get("id")
        if not isinstance(entry_id, str) or not entry_id:
            errors.append(f"{label}: entry id is required")
            continue
        if entry_id in indexed:
            errors.append(f"{label}: duplicate id {entry_id}")
        indexed[entry_id] = entry
    return indexed


def validate(mode: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    blocks: list[str] = []

    enterprise = load_yaml(ROOT / "enterprise.yaml", errors)
    models_doc = load_yaml(ROOT / "model-registry.yaml", errors)
    agents_doc = load_yaml(ROOT / "agent-registry.yaml", errors)
    clients_doc = load_yaml(ROOT / "client-policy-registry.yaml", errors)
    surfaces_doc = load_yaml(ROOT / "surface-matrix.yaml", errors)
    mesh = load_yaml(ROOT / "mesh-routing.yaml", errors)

    organization_paths = sorted((ROOT / "organizations").glob("*.yaml"))
    team_paths = sorted((ROOT / "teams").glob("*.yaml"))
    organizations = [(path, load_yaml(path, errors)) for path in organization_paths]
    teams = [(path, load_yaml(path, errors)) for path in team_paths]

    metadata = enterprise.get("metadata", {})
    authority = enterprise.get("authority", {})
    runtime = authority.get("runtime", {})
    scope = enterprise.get("scope", {})
    organization_scope = scope.get("organization", {})
    enterprise_scope = scope.get("enterprise", {})
    teams_mode = scope.get("enterprise_teams_mode", {})
    native = enterprise.get("model_resolution", {}).get("github_native", {})
    overlay = enterprise.get("model_resolution", {}).get("pfu_overlay", {})
    organization_policy = enterprise.get("organization_policy", {})
    controls = enterprise.get("controls", {})
    enterprise_evidence = enterprise.get("evidence", {})

    if authority.get("repository_role") != "desired_state_validation_and_evidence_only":
        errors.append("enterprise.yaml must preserve the repository/runtime authority boundary")
    if runtime.get("policies_and_models") != "github_enterprise_ai_controls":
        errors.append("policy and model authority must be GitHub Enterprise AI Controls")
    if runtime.get("seat_assignment") != "github_billing_and_licensing":
        errors.append("seat assignment authority must be GitHub Billing and licensing")
    if scope.get("repository_owner", {}).get("account_type") != "user":
        errors.append("repository owner must remain classified as a user until contrary evidence exists")
    if enterprise.get("preview", {}).get("github_availability") != "opt_in_preview":
        errors.append("preview availability and PFU enrollment state must remain separate")
    if enterprise.get("preview", {}).get("pfu_enrollment_state") not in {
        "unverified",
        "not_enrolled",
        "enrolled",
    }:
        errors.append("PFU preview enrollment state is invalid")

    expected_native = {
        "enterprise_disabled": "deny",
        "enterprise_enabled": "allow_for_users_governed_by_enterprise",
        "optional_when_teams_mode_disabled": "organization_controlled",
        "optional_when_teams_mode_enabled": "verified_team_grant_required",
        "unconfigured_when_teams_mode_disabled": "default_availability_policy",
        "unconfigured_when_teams_mode_enabled": "unavailable_by_default",
        "multi_team_membership_when_enabled": "union",
        "cross_enterprise": "most_restrictive_almost_always",
    }
    for key, expected in expected_native.items():
        if native.get(key) != expected:
            errors.append(f"GitHub-native model resolution {key} must be {expected}")
    if overlay.get("multiple_license_sources") != "explicit_external_resolution_required":
        errors.append("PFU must stop external routing for explicit license-source resolution")
    if overlay.get("routing_effect") != "stop_external_mesh_routing":
        errors.append("PFU cross-enterprise behavior must be limited to external mesh routing")
    if overlay.get("overrides_github_enforcement") is not False:
        errors.append("PFU overlay must not claim to override GitHub enforcement")

    expected_org_modes = {
        "when_teams_mode_unverified": "conditional_reference",
        "when_teams_mode_disabled": "organization_controlled",
        "when_teams_mode_enabled": "deactivated",
    }
    for key, expected in expected_org_modes.items():
        if organization_policy.get(key) != expected:
            errors.append(f"organization policy {key} must be {expected}")

    for key in (
        "audit_log_required",
        "access_test_required",
        "rollback_record_required",
        "human_approval_for_frontier",
        "frontier_expiry_required",
        "signed_snapshot_required",
    ):
        if controls.get(key) is not True:
            errors.append(f"control {key} must be enabled")
    if controls.get("maximum_snapshot_age_minutes") != 60:
        errors.append("maximum snapshot age must remain 60 minutes")
    if controls.get("live_sync_enabled") is not False:
        errors.append("live synchronization must remain disabled")

    status = metadata.get("status")
    expected_verdicts = {
        "inventory_required": "governance_green_inventory_required",
        "activation_ready": "governance_green_evidence_verified",
    }
    if status not in expected_verdicts:
        errors.append("metadata.status must be inventory_required or activation_ready")
    elif metadata.get("release_verdict") != expected_verdicts[status]:
        errors.append("release verdict does not match the declared inventory posture")
    if metadata.get("merge_authorized") is not False:
        errors.append("merge must remain unauthorized in this correction packet")
    if metadata.get("activation_authorized") is not False:
        errors.append("activation must remain unauthorized in this correction packet")

    add_block(blocks, not nonempty(enterprise_scope.get("slug")), "enterprise slug is unverified")
    add_block(blocks, not nonempty(enterprise_scope.get("expected_slug")), "expected enterprise slug is unverified")
    if nonempty(enterprise_scope.get("slug")) and nonempty(enterprise_scope.get("expected_slug")):
        add_block(
            blocks,
            enterprise_scope.get("slug") != enterprise_scope.get("expected_slug"),
            "enterprise slug does not match the expected slug",
        )
    add_block(blocks, enterprise_scope.get("active") is not True, "enterprise active state is unverified")
    add_block(blocks, enterprise_scope.get("accessible") is not True, "enterprise accessibility is unverified")
    add_block(blocks, not nonempty(organization_scope.get("slug")), "organization slug is unverified")
    add_block(
        blocks,
        organization_scope.get("membership_verified") is not True,
        "organization membership is unverified",
    )
    add_block(
        blocks,
        scope.get("copilot_plan") not in {"copilot_business", "copilot_enterprise"},
        "Copilot plan is unverified",
    )
    add_block(blocks, teams_mode.get("observed") is not True, "Enterprise Teams mode is unobserved")
    if teams_mode.get("enabled") not in {True, False}:
        errors.append("Enterprise Teams mode enabled must be boolean")
    add_block(
        blocks,
        scope.get("default_model_availability") not in {"enabled", "disabled"},
        "default model availability is unverified",
    )

    required_enterprise_evidence = (
        "observed_by",
        "source_url",
        "snapshot_sha256",
        "snapshot_signature",
        "snapshot_signature_algorithm",
        "snapshot_signer_key_id",
        "access_test_evidence_url",
        "audit_log_evidence_url",
        "rollback_record_url",
    )
    for field in required_enterprise_evidence:
        add_block(blocks, not nonempty(enterprise_evidence.get(field)), f"enterprise evidence {field} is required")
    snapshot_sha = enterprise_evidence.get("snapshot_sha256")
    if nonempty(snapshot_sha) and not SHA256_RE.fullmatch(str(snapshot_sha)):
        blocks.append("enterprise evidence snapshot_sha256 must be 64 lowercase hexadecimal characters")
    add_block(
        blocks,
        enterprise_evidence.get("snapshot_signature_verified") is not True,
        "enterprise snapshot signature is not verified",
    )
    observed_at = parse_time(enterprise_evidence.get("observed_at"), "enterprise evidence observed_at", blocks)
    if observed_at:
        age_minutes = (datetime.now(timezone.utc) - observed_at).total_seconds() / 60
        if age_minutes < -5:
            blocks.append("enterprise evidence observed_at is in the future")
        elif age_minutes > controls.get("maximum_snapshot_age_minutes", 60):
            blocks.append("enterprise evidence snapshot exceeds the 60-minute freshness gate")

    models = models_doc.get("models", []) or []
    if not isinstance(models, list):
        errors.append("model registry models must be a list")
        models = []
    model_by_id = unique_registry_entries(models, label="model registry", errors=errors)
    if not model_by_id:
        blocks.append("live model inventory is empty")
    for model_id, model in model_by_id.items():
        if not CANONICAL_ID_RE.fullmatch(model_id):
            errors.append(f"model {model_id!r} is not a canonical identifier")
        if model.get("state") not in VALID_MODEL_STATES:
            errors.append(f"model {model_id} has invalid state {model.get('state')!r}")
        add_block(blocks, not nonempty(model.get("observed_at")), f"model {model_id} observed_at is required")
        add_block(blocks, not nonempty(model.get("evidence_url")), f"model {model_id} evidence_url is required")

    agents = agents_doc.get("agents", []) or []
    if not isinstance(agents, list):
        errors.append("agent registry agents must be a list")
        agents = []
    agent_by_id = unique_registry_entries(agents, label="agent registry", errors=errors)
    if "copilot_cli" in agent_by_id:
        errors.append("copilot_cli is a client policy and cannot be registered as an agent")
    for agent_id, agent in agent_by_id.items():
        if agent.get("observed_state") not in VALID_OBSERVED_STATES:
            errors.append(f"agent {agent_id} has invalid observed_state")
        if agent.get("governance_scope") != "separate_agent_policy":
            errors.append(f"agent {agent_id} must use separate_agent_policy scope")
        add_block(blocks, agent.get("observed_state") == "unverified", f"agent {agent_id} state is unverified")
        add_block(blocks, not nonempty(agent.get("observed_at")), f"agent {agent_id} observed_at is required")
        add_block(blocks, not nonempty(agent.get("evidence_url")), f"agent {agent_id} evidence_url is required")

    clients = clients_doc.get("client_policies", []) or []
    if not isinstance(clients, list):
        errors.append("client policy registry must contain a list")
        clients = []
    client_by_id = unique_registry_entries(clients, label="client policy registry", errors=errors)
    if "copilot_cli" not in client_by_id:
        errors.append("client policy registry must contain copilot_cli")
    for client_id, client in client_by_id.items():
        if client.get("observed_state") not in VALID_OBSERVED_STATES:
            errors.append(f"client policy {client_id} has invalid observed_state")
        if client.get("governance_scope") != "independent_client_policy":
            errors.append(f"client policy {client_id} must be independent")
        add_block(blocks, client.get("observed_state") == "unverified", f"client policy {client_id} is unverified")
        add_block(blocks, not nonempty(client.get("observed_at")), f"client policy {client_id} observed_at is required")
        add_block(blocks, not nonempty(client.get("evidence_url")), f"client policy {client_id} evidence_url is required")

    surfaces = surfaces_doc.get("surfaces", []) or []
    if not isinstance(surfaces, list):
        errors.append("surface matrix surfaces must be a list")
        surfaces = []
    surface_by_id = unique_registry_entries(surfaces, label="surface matrix", errors=errors)
    if set(surface_by_id) != EXPECTED_SURFACES:
        errors.append(f"surface matrix must contain exactly {sorted(EXPECTED_SURFACES)}")
    for surface_id, surface in surface_by_id.items():
        if surface.get("observed_state") not in VALID_OBSERVED_STATES:
            errors.append(f"surface {surface_id} has invalid observed_state")
        add_block(blocks, surface.get("observed_state") == "unverified", f"surface {surface_id} is unverified")
        add_block(blocks, not nonempty(surface.get("observed_at")), f"surface {surface_id} observed_at is required")
        add_block(blocks, not nonempty(surface.get("evidence_url")), f"surface {surface_id} evidence_url is required")

    if not organizations:
        errors.append("at least one conditional organization reference is required")
    for path, organization in organizations:
        relative = str(path.relative_to(ROOT))
        if organization.get("repository_owner", {}).get("account_type") != "user":
            errors.append(f"{relative}: repository owner account_type must be user")
        if organization.get("repository_owner", {}).get("is_organization") is not False:
            errors.append(f"{relative}: user-owned repository cannot be claimed as an organization")
        expected_modes = {
            "when_enterprise_teams_mode_unverified": "conditional_reference",
            "when_enterprise_teams_mode_disabled": "organization_controlled",
            "when_enterprise_teams_mode_enabled": "deactivated",
        }
        for key, expected in expected_modes.items():
            if organization.get("mode", {}).get(key) != expected:
                errors.append(f"{relative}: mode {key} must be {expected}")
        add_block(blocks, not nonempty(organization.get("organization_slug")), f"{relative}: organization slug is required")
        add_block(
            blocks,
            organization.get("organization_membership_verified") is not True,
            f"{relative}: organization membership is unverified",
        )
        org_evidence = organization.get("evidence", {})
        for field in ("observed_at", "observed_by", "source_url", "snapshot_sha256"):
            add_block(blocks, not nonempty(org_evidence.get(field)), f"{relative}: evidence {field} is required")
        org_sha = org_evidence.get("snapshot_sha256")
        if nonempty(org_sha) and not SHA256_RE.fullmatch(str(org_sha)):
            blocks.append(f"{relative}: evidence snapshot_sha256 is invalid")

    if not teams:
        errors.append("at least one enterprise team manifest is required")
    team_ids: set[str] = set()
    for path, team in teams:
        relative = str(path.relative_to(ROOT))
        team_id = team.get("team_id")
        if not isinstance(team_id, str) or not team_id:
            errors.append(f"{relative}: team_id is required")
            continue
        if team_id in team_ids:
            errors.append(f"duplicate team_id {team_id}")
        team_ids.add(team_id)
        if team.get("access_mode") not in VALID_ACCESS_MODES:
            errors.append(f"{relative}: invalid access_mode")
        if "model_denials" in team:
            errors.append(f"{relative}: teams cannot define model_denials")
        membership = team.get("membership", {})
        if membership.get("explicit_assignment_required") is not True:
            errors.append(f"{relative}: explicit assignment must be required")
        if membership.get("multi_team_union_review_required") is not True:
            errors.append(f"{relative}: multi-team union review must be required")
        add_block(blocks, not nonempty(team.get("github_enterprise_team_slug")), f"{relative}: enterprise team slug is unverified")
        add_block(blocks, not nonempty(membership.get("observed_members")), f"{relative}: membership inventory is empty")
        add_block(blocks, not nonempty(membership.get("observed_at")), f"{relative}: membership observed_at is required")
        add_block(blocks, not nonempty(membership.get("evidence_url")), f"{relative}: membership evidence_url is required")
        team_evidence = team.get("evidence", {})
        for field in ("observed_at", "source_url"):
            add_block(blocks, not nonempty(team_evidence.get(field)), f"{relative}: team evidence {field} is required")
        for model_id in team.get("model_grants", []) or []:
            model = model_by_id.get(model_id)
            if model is None:
                errors.append(f"{relative}: unknown model grant {model_id}")
            elif model.get("state") != "optional":
                errors.append(f"{relative}: only optional models may be granted to teams ({model_id})")
        for agent_id in team.get("agent_grants", []) or []:
            if agent_id not in agent_by_id:
                errors.append(f"{relative}: unknown agent grant {agent_id}")
        if team.get("access_mode") == "frontier_review":
            approval = team.get("approval", {})
            if approval.get("founder_approval_required") is not True:
                errors.append(f"{relative}: frontier access must require founder approval")
            add_block(blocks, approval.get("founder_approved") is not True, f"{relative}: founder approval is missing")
            for field in ("founder_approved_by", "founder_approved_at", "expires_at", "evidence_url"):
                add_block(blocks, not nonempty(approval.get(field)), f"{relative}: approval {field} is required")
            expires_at = approval.get("expires_at")
            if nonempty(expires_at):
                expiry = parse_time(expires_at, f"{relative}: approval expires_at", blocks)
                if expiry and expiry <= datetime.now(timezone.utc):
                    blocks.append(f"{relative}: frontier approval is expired")

    input_contract = mesh.get("input_contract", {})
    for key in (
        "authenticated_user_required",
        "enterprise_license_source_required",
        "signed_policy_snapshot_required",
        "snapshot_sha256_required",
        "snapshot_observed_at_required",
    ):
        if input_contract.get(key) is not True:
            errors.append(f"mesh input contract {key} must be enabled")
    if input_contract.get("maximum_snapshot_age_minutes") != 60:
        errors.append("mesh maximum snapshot age must be 60 minutes")
    rules = {rule.get("id"): rule for rule in (mesh.get("rules", []) or []) if isinstance(rule, dict)}
    expected_rule_actions = {
        "enterprise_hard_deny": "deny",
        "enterprise_baseline_allow": "allow_for_users_governed_by_enterprise",
        "optional_organization_control": "resolve_from_organization_policy",
        "optional_team_grant": "require_verified_team_grant",
        "unconfigured_non_team_mode": "resolve_from_default_availability_policy",
        "unconfigured_team_mode": "deny_by_default",
        "multi_team_union": "compute_union_and_record_evidence",
        "cross_enterprise_boundary": "stop_external_mesh_routing_for_explicit_resolution",
    }
    for rule_id, expected_action in expected_rule_actions.items():
        if rules.get(rule_id, {}).get("action") != expected_action:
            errors.append(f"mesh rule {rule_id} must use action {expected_action}")
    cross_rule = rules.get("cross_enterprise_boundary", {})
    if cross_rule.get("authority") != "pfu_overlay":
        errors.append("cross-enterprise routing stop must be identified as a PFU overlay")
    if cross_rule.get("github_native_behavior") != "most_restrictive_almost_always":
        errors.append("cross-enterprise rule must preserve GitHub-native behavior")
    if cross_rule.get("overrides_github_enforcement") is not False:
        errors.append("cross-enterprise routing stop must not claim to override GitHub")

    required_outputs = {
        "github_native_policy_result",
        "pfu_routing_decision",
        "authority_source",
        "evidence_reference",
        "snapshot_hash",
    }
    if not required_outputs.issubset(set(mesh.get("outputs", []) or [])):
        errors.append("mesh outputs are missing required native, PFU, evidence, or snapshot fields")

    if status == "inventory_required" and not blocks:
        errors.append("inventory_required posture must have at least one documented activation block")
    if status == "activation_ready" and blocks:
        errors.append("activation_ready posture cannot contain activation blocks")
    if mode == "activation" and blocks:
        errors.extend(f"ACTIVATION BLOCK: {block}" for block in blocks)

    return errors, blocks


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate PFU Copilot governance policy")
    parser.add_argument("--mode", choices=("structural", "activation"), default="structural")
    args = parser.parse_args()

    errors, blocks = validate(args.mode)
    print(f"PFU Copilot governance validation ({args.mode})")
    for block in blocks:
        print(f"BLOCK: {block}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"PASS: governance structure is valid; activation blocks={len(blocks)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
