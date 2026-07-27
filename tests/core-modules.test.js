import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductSpec, runCommerceSync, pricingCalculator, buildPrompt } from '../src/modules/index.js';

const config = { defaultCurrency: 'USD', minMarginPercent: 35 };

test('PRODUCT_FACTORY prepares a distribution manifest', () => {
  const result = createProductSpec({
    title: 'Creator Launch Kit',
    format: 'pdf-template-pack',
    audience: 'digital product creators',
    assets: ['guide.pdf'],
    tags: ['launch', 'creator']
  });

  assert.equal(result.status, 'prepared');
  assert.equal(result.product.id, 'ms-creator-launch-kit');
  assert.equal(result.product.metadata.distributionReady, true);
  assert.ok(result.product.distributionManifest.requiredFiles.includes('product.json'));
});

test('SYNC.NODE.COMMERCE returns synced when offer, proof, and delivery align', () => {
  const result = runCommerceSync({
    offer: {
      name: 'Creator Launch Kit',
      audience: 'digital product creators',
      valueProps: ['launch checklist', 'offer copy', 'delivery map'],
      cost: 10,
      price: 25
    },
    proof: {
      source: 'internal QA',
      claim: 'Reduces launch drift',
      evidenceType: 'audit',
      confidence: 'verified'
    },
    delivery: {
      promise: 'Creator Launch Kit helps creators launch with less drift',
      promisedOutcomes: ['checklist', 'copy'],
      deliverables: ['launch checklist', 'offer copy pack']
    }
  }, config);

  assert.equal(result.status, 'synced');
  assert.equal(result.drift.length, 0);
});

test('SYNC.NODE.COMMERCE detects proof and delivery drift', () => {
  const result = runCommerceSync({
    offer: {
      name: 'Creator Launch Kit',
      audience: 'digital product creators',
      valueProps: ['launch checklist'],
      cost: 10,
      price: 20
    },
    proof: {
      source: 'testimonial',
      claim: 'Improves launch quality',
      evidenceType: 'quote'
    },
    delivery: {
      promise: 'Generic launch support',
      promisedOutcomes: ['checklist'],
      deliverables: ['video lesson']
    }
  }, config);

  assert.equal(result.status, 'drift_detected');
  assert.ok(result.drift.some((item) => item.area === 'proof'));
  assert.ok(result.drift.some((item) => item.area === 'delivery'));
});

test('CREATOR_TOOLS pricing calculator protects target margin', () => {
  const result = pricingCalculator({ cost: 13, targetMarginPercent: 35 });
  assert.equal(result.recommendedPrice, 20);
  assert.equal(result.marginPercent, 35);
});

test('AI_CORE builds prompt payload with configured assistant role', () => {
  const result = buildPrompt({ objective: 'Generate product metadata', constraints: ['No drift'] });
  assert.equal(result.messages[0].role, 'system');
  assert.match(result.messages[0].content, /MERCH SHIP/);
});
