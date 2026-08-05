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

if (
  !acceptance.includes('PHASE-1A ACCEPTANCE:       PENDING') ||
  !acceptance.includes('LIVE SUPABASE MUTATION:    NOT_RUN — FORBIDDEN')
) {
  throw new Error('Phase-1A acceptance must remain pending before runtime proof.');
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
