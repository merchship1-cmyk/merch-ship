# Zenzy Phase 0

Zenzy v2 is the isolated mobile successor to the frozen Z-001 v1 heritage
component in ../todo-app/.

## Product contract

- Lane: MESS → CLARITY → EXECUTION
- Loop: IDEA → PLAN → CREATE → SCHEDULE → REVIEW
- First useful result appears before an account wall.
- Phase 0 captures time saved, steps removed, clarity gained, output produced,
  and whether the user would use Zenzy again.

## Local runtime

1. Copy .env.example to .env.local.
2. Leave EXPO_PUBLIC_ZENZY_AI_MODE set to mock.
3. Run npm install.
4. Run npm start.

Remote mode requires an approved Supabase Edge Function deployment. The OpenAI
key belongs only in Supabase secrets, never in the Expo environment.

## Verification

Run npm run verify to execute the schema, structured-output, tests, type,
lint, secret-boundary, governance, lineage, and Expo export checks.

## OpenAI implementation

The server function uses the Responses API and strict structured output. Its
default model is gpt-5.6-sol and may be overridden with the server-only
OPENAI_MODEL environment variable.

Official references:

- https://developers.openai.com/api/docs/guides/text
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety

## Authority boundary

The implementation agent may build and verify this package. Ryan Richard
Levack-Carr remains the merge and deployment authority. See
governance/ZAC-P0-001.md.
