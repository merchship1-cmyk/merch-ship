from __future__ import annotations

import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
errors: list[str] = []
warnings: list[str] = []


def load_yaml(relative_path: str) -> dict:
    path = ROOT / relative_path
    try:
        value = yaml.safe_load(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except Exception as exc:  # validation must report every malformed file
        errors.append(f"{relative_path}: {exc}")
        return {}


enterprise = load_yaml("enterprise.yaml")
models_doc = load_yaml("model-registry.yaml")
agents_doc = load_yaml("agent-registry.yaml")
surfaces_doc = load_yaml("surface-matrix.yaml")
mesh = load_yaml("mesh-routing.yaml")

if enterprise.get("authority", {}).get("repository_role") != "desired_state_and_evidence_only":
    errors.append("enterprise.yaml must preserve the repository/runtime authority boundary")

resolution = enterprise.get("model_resolution", {})
if resolution.get("enterprise_disabled") != "deny":
    errors.append("enterprise disabled models must resolve to deny")
if resolution.get("multi_team_membership") != "union":
    errors.append("multi-team access must be modeled as an additive union")
if resolution.get("cross_enterprise") != "explicit_external_resolution_required":
    errors.append("cross-enterprise resolution must require explicit external resolution")

valid_model_states = {"enabled", "disabled", "optional", "unconfigured"}
models = models_doc.get("models", []) or []
model_by_id: dict[str, dict] = {}
for model in models:
    model_id = model.get("id")
    state = model.get("state")
    if not model_id:
        errors.append("model entry is missing id")
    if state not in valid_model_states:
        errors.append(f"model {model_id!r} has invalid state {state!r}")
    if model_id in model_by_id:
        errors.append(f"duplicate model id {model_id}")
    if model_id:
        model_by_id[model_id] = model
if not models:
    warnings.append("model registry is empty; live inventory is still required")

team_ids: dict[str, str] = {}
for path in sorted((ROOT / "teams").glob("*.yaml")):
    relative = str(path.relative_to(ROOT))
    team = load_yaml(relative)
    team_id = team.get("team_id")
    if not team_id:
        errors.append(f"{relative}: team_id is required")
    if team_id in team_ids:
        errors.append(f"duplicate team_id {team_id}")
    if team_id:
        team_ids[team_id] = relative
    if "model_denials" in team:
        errors.append(f"{relative}: teams cannot define model_denials")
    for model_id in team.get("model_grants", []) or []:
        model = model_by_id.get(model_id)
        if model is None:
            errors.append(f"{relative}: unknown model grant {model_id}")
        elif model.get("state") != "optional":
            errors.append(f"{relative}: only optional models may be granted to teams ({model_id})")
    if not team.get("github_enterprise_team_slug"):
        warnings.append(f"{relative}: GitHub enterprise team slug is unverified")
if not team_ids:
    errors.append("at least one enterprise team manifest is required")

valid_observed_states = {"enabled", "disabled", "review_required", "unverified"}
for agent in agents_doc.get("agents", []) or []:
    state = agent.get("observed_state")
    if state not in valid_observed_states:
        errors.append(f"agent {agent.get('id')} has invalid observed_state {state!r}")
for surface in surfaces_doc.get("surfaces", []) or []:
    state = surface.get("observed_state")
    if state not in valid_observed_states:
        errors.append(f"surface {surface.get('id')} has invalid observed_state {state!r}")

cross_rule = next(
    (rule for rule in (mesh.get("rules", []) or []) if rule.get("id") == "cross_enterprise_boundary"),
    None,
)
if not cross_rule or cross_rule.get("action") != "explicit_external_resolution_required":
    errors.append("mesh must stop for explicit cross-enterprise resolution")

print("PFU Copilot governance validation")
for warning in warnings:
    print(f"WARNING: {warning}")
if errors:
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    raise SystemExit(1)

print("PASS: manifests are structurally valid; runtime inventory may still be pending")
