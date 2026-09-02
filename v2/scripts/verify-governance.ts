import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const contractPath = resolve('governance/ZAC-P0-001.md');
const phasePath = resolve('governance/phase-0-contract.json');
const phaseOneContractPath = resolve(
  'governance/PHASE-1A-SLICE1-CONTRACT.md',
);
const acceptancePath = resolve('governance/PHASE-1A-ACCEPTANCE.md');
const contract = readFileSync(contractPath, 'utf8');
const phaseOneContract = readFileSync(phaseOneContractPath, 'utf8');
const acceptance = readFileSync(acceptancePath, 'utf8');
const phase = JSON.parse(readFileSync(phasePath, 'utf8')) as {
  id?: string;
  lane?: string;
  targetPath?: string;
  protectedPaths?: string[];
  loop?: string[];
};

const requiredContractClauses = [
  'AGENT ROLE',
  'Implementation-only',
  'No product, architecture, or strategy authority',
  'todo-app/',
  'STOP BEFORE MERGE OR DEPLOYMENT',
];

for (const clause of requiredContractClauses) {
  if (!contract.includes(clause)) {
    throw new Error('Agent contract is missing required clause: ' + clause);
  }
}

const requiredPhaseOneClauses = [
  'server-derived ownership',
  'owner-scoped reads only',
  'todo-app/',
  'No live migration',
  'No Notion runtime adapter',
  'draft pull request',
];

for (const clause of requiredPhaseOneClauses) {
  if (!phaseOneContract.includes(clause)) {
    throw new Error('Phase-1A contract is missing required clause: ' + clause);
  }
}

const requiredAcceptanceClauses = [
  'AUTHENTICATED RUNTIME:     PASS — TWO-USER PROOF',
  'CROSS-USER ISOLATION:      PASS — DENIAL + READ ISOLATION',
  'ACCEPTANCE/EVIDENCE FLOW:  PASS — GENERATED → REVIEWED → VERIFIED',
  'EDGE HTTP AUTH:            PASS — VERIFIED BEARER/JWT RUNTIME',
  'ANDROID RELEASE + TEST APK: PASS',
  'ANDROID DETOX:             PASS — API 34 EMULATOR',
  'PHASE-1A REQUIRED GATE:    PASS',
  'PRODUCTION RELEASE:        NOT_AUTHORIZED',
  'MERGE AUTHORIZATION:       NOT_AUTHORIZED',
  'PHASE-1A ACCEPTANCE:       PASS — BOUNDED GREEN',
  'Phase 1A PASS is scoped only to the Phase 1A implementation and evidence gate represented by this pull request.',
  'It does not authorize production release, production deployment, merge, tester acceptance, broader ZENZY authority, or globally enforced GOV-OS behavior.',
];

for (const clause of requiredAcceptanceClauses) {
  if (!acceptance.includes(clause)) {
    throw new Error('Phase-1A acceptance record is missing required evidence-consistent clause: ' + clause);
  }
}

const obsoleteAcceptanceClauses = [
  'PHASE-1A ACCEPTANCE:       PENDING',
  'RLS ISOLATION:             NOT_RUN',
  'EDGE HTTP AUTH:            NOT_RUN',
  'ANDROID DETOX:             NOT_RUN',
];

for (const clause of obsoleteAcceptanceClauses) {
  if (acceptance.includes(clause)) {
    throw new Error('Phase-1A acceptance record still contains obsolete pre-runtime status: ' + clause);
  }
}

if (
  phase.id !== 'ZAC-P0-001' ||
  phase.lane !== 'MESS → CLARITY → EXECUTION' ||
  phase.targetPath !== 'v2/' ||
  !phase.protectedPaths?.includes('todo-app/') ||
  phase.loop?.join(' → ') !== 'IDEA → PLAN → CREATE → SCHEDULE → REVIEW'
) {
  throw new Error('Phase 0 governance contract does not match ZAC-P0-001.');
}

console.log('Phase 0 and Phase-1A governance contracts are valid.');
