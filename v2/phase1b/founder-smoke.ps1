param(
  [string]$TargetRef = "8bcd9c9e1d0ce3cfaecfffc779ec5ace95ee1a6c",
  [string]$RepoUrl = "https://github.com/merchship1-cmyk/merch-ship.git"
)

$ErrorActionPreference = "Stop"

$short = $TargetRef.Substring(0, [Math]::Min(8, $TargetRef.Length))
$root = Join-Path $env:TEMP "zenzy-founder-smoke-$short"

Write-Host "ZENZY Phase 1B-FST — INTERNAL / MOCK / NON-PRODUCTION"
Write-Host "Target: $TargetRef"
Write-Host "Workspace: $root"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "Git is required." }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 22 is required." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm is required." }

$nodeVersion = (node --version).Trim()
if ($nodeVersion -notmatch '^v22\.') {
  throw "Node.js 22 is required for the Founder Test Pack. Found $nodeVersion."
}
Write-Host "Node runtime: $nodeVersion"

if (-not (Test-Path $root)) {
  git clone --no-checkout $RepoUrl $root
} else {
  git -C $root remote set-url origin $RepoUrl
}

git -C $root fetch --prune origin
git -C $root checkout --detach $TargetRef

$resolved = (git -C $root rev-parse HEAD).Trim()
if ($resolved -ne $TargetRef) {
  throw "Source mismatch. Expected $TargetRef but resolved $resolved"
}

Set-Location (Join-Path $root "v2")

$env:EXPO_PUBLIC_ZENZY_AI_MODE = "mock"
$env:EXPO_PUBLIC_ZENZY_API_URL = ""
$env:EXPO_PUBLIC_ZENZY_ACCEPT_URL = ""
$env:EXPO_PUBLIC_ZENZY_EVIDENCE_URL = ""
$env:EXPO_PUBLIC_SUPABASE_URL = ""
$env:EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ""
$env:ZENZY_DETOX = ""
$env:ZENZY_PHASE1B_PREVIEW = ""
$env:ZENZY_EAS_PROJECT_ID = ""

Write-Host "Source verified: $resolved"
Write-Host "AI mode: MOCK"
Write-Host "Production API/Supabase values: CLEARED"

Write-Host "Installing locked dependencies..."
npm ci

Write-Host "Running Android Expo bundle check..."
npm run build:check

Write-Host "Starting Expo in MOCK mode. Use the QR code with the Android test device."
Write-Host "This session does not deploy production or modify GitHub."
npx expo start --clear
