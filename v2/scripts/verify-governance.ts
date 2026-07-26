import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const contractPath = resolve('governance/ZAC-P0-001.md');
const phasePath = resolve('governance/phase-0-contract.json');
const contract = readFileSync(contractPath, 'utf8');
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

if (
  phase.id !== 'ZAC-P0-001' ||
  phase.lane !== 'MESS → CLARITY → EXECUTION' ||
  phase.targetPath !== 'v2/' ||
  !phase.protectedPaths?.includes('todo-app/') ||
  phase.loop?.join(' → ') !== 'IDEA → PLAN → CREATE → SCHEDULE → REVIEW'
) {
  throw new Error('Phase 0 governance contract does not match ZAC-P0-001.');
}

console.log('ZAC-P0-001 governance contract is valid.');
