# System Jungle Index implementation package

This folder is the portable SSOT for the **SYSTEM JUNGLE INDEX — Founder Cockpit v2.0**.

## Files

- `SYSTEM_JUNGLE_INDEX_Founder_Cockpit_Implementation_Pack_v2.0.docx` — human-readable implementation pack.
- `SYSTEM_JUNGLE_INDEX_Founder_Cockpit_v2.0.md` — canonical Markdown specification.
- `sji-sync-machine-agents.yaml` — Sync Machine agent contracts.
- `sji-n8n-workflow-spec.json` — n8n workflow design contract.
- `sji-ghl-flow-spec.yaml` — GHL projection workflow contract.
- `sji-record.schema.json` — JSON Schema for SJI record payloads.

## Deployment boundary

These automation files intentionally omit credentials and environment secrets. Inject Notion/GHL credentials, webhook secrets, and test adapters through the deployment environment. No workflow may independently grant authority, bypass rollback verification, or issue GREEN without evidence-backed verification.

## Live Notion

- [Founder Cockpit](https://app.notion.com/p/3ad13e5cbb9f819982dfd36a356f77df)
- [Primary Registry](https://app.notion.com/p/a6bd3c8de0f44939aa1ab9dbe2700030)
