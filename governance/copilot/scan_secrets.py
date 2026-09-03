from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent
ALLOWED_SUFFIXES = {".json", ".md", ".py", ".yaml", ".yml"}
SENSITIVE_KEYS = {
    "access_token",
    "api_key",
    "client_secret",
    "password",
    "private_key",
    "secret",
    "service_role_key",
    "token",
}
PATTERNS = {
    "GitHub classic token": re.compile(r"gh" + r"[pousr]_[A-Za-z0-9]{20,}"),
    "GitHub fine-grained token": re.compile(r"github" + r"_pat_[A-Za-z0-9_]{20,}"),
    "OpenAI API key": re.compile(r"sk" + r"-(?:proj-)?[A-Za-z0-9_-]{20,}"),
    "AWS access key": re.compile(r"AKIA[A-Z0-9]{16}"),
    "Slack token": re.compile(r"xox" + r"[baprs]-[A-Za-z0-9-]{20,}"),
    "private key": re.compile(r"BEGIN [A-Z ]*PRIVATE KEY"),
    "JWT": re.compile(r"eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}"),
}


def walk_sensitive_values(value: Any, path: str, findings: list[str]) -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if str(key).lower() in SENSITIVE_KEYS and child not in (None, "", [], {}):
                findings.append(f"{child_path}: non-empty sensitive key")
            walk_sensitive_values(child, child_path, findings)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            walk_sensitive_values(child, f"{path}[{index}]", findings)


def main() -> int:
    findings: list[str] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or "__pycache__" in path.parts:
            continue
        relative = str(path.relative_to(ROOT))
        if path.suffix not in ALLOWED_SUFFIXES:
            findings.append(f"{relative}: unexpected file type")
            continue
        text = path.read_text(encoding="utf-8")
        for label, pattern in PATTERNS.items():
            if pattern.search(text):
                findings.append(f"{relative}: potential {label}")
        try:
            if path.suffix in {".yaml", ".yml"}:
                walk_sensitive_values(yaml.safe_load(text), relative, findings)
            elif path.suffix == ".json":
                walk_sensitive_values(json.loads(text), relative, findings)
        except Exception as exc:
            findings.append(f"{relative}: structured-file parse failed: {exc}")

    if findings:
        for finding in findings:
            print(f"FINDING: {finding}")
        return 1
    print("PASS: no high-risk credential patterns or populated sensitive keys detected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
