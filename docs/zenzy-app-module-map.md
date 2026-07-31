# Zenzy App Module Map

Status: BLUE — runtime integration in progress  
Updated: 2026-07-31  
Authority: ZENZY OS

| Module | App route | Primary responsibility | Engine mapping |
| --- | --- | --- | --- |
| Home | `/home` | Current state, next action, and product signal | Identity · User · Product |
| Flows | `/flows` | Multi-step execution and handoff orchestration | Workflow · Sync · AI Mesh |
| Tasks | `/tasks` | Action queue, ownership, and completion evidence | Workflow · User · Product |
| Content | `/content` | Asset creation, refinement, and commercial readiness | Product · AI Mesh · Commerce |
| Sync | `/sync` | Cross-system state, evidence, and conflict handling | Sync · Workflow · AI Mesh |
| Users | `/users` | Profiles, access, roles, and participation | User · Identity |
| Settings | `/settings` | Runtime configuration, governance, and permissions | Identity · Sync · User |

## Backend routes

| Route | Purpose | Authorization |
| --- | --- | --- |
| `GET /api/healthz` | Process liveness | Public |
| `GET /api/zenzy/health` | Runtime configuration readiness | Public, values redacted |
| `GET /api/zenzy/modules` | Canonical module registry | Public |
| `POST /api/zenzy/process` | Governed AI transformation | Supabase bearer token |

## Runtime boundary

Supabase owns identity validation and persisted application state. OpenAI owns structured transformation generation. The backend owns authorization, input validation, routing, redacted health reporting, and release-safe error handling.
