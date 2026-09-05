#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { runCommerceSync } from '../src/modules/sync-node-commerce/index.js';
import { env } from '../src/config/env.js';

const inputPath = process.argv[2];

const sample = {
  offer: {
    name: 'Creator Launch Kit',
    audience: 'digital product creators',
    valueProps: ['launch checklist', 'offer copy', 'delivery map'],
    cost: 12,
    price: 29
  },
  proof: {
    source: 'internal QA',
    claim: 'Reduces launch preparation drift',
    evidenceType: 'checklist-audit',
    confidence: 'verified'
  },
  delivery: {
    promise: 'Creator Launch Kit helps creators ship faster',
    promisedOutcomes: ['checklist', 'copy', 'map'],
    deliverables: ['launch checklist', 'offer copy pack', 'delivery map'],
    accessMethod: 'digital-download'
  }
};

const input = inputPath ? JSON.parse(await readFile(inputPath, 'utf8')) : sample;
console.log(JSON.stringify(runCommerceSync(input, env), null, 2));
