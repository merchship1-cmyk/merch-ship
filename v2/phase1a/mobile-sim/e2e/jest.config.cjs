const fs = require('node:fs');

/** @type {import('@jest/types').Config.InitialOptions} */
function hasUsableKvm() {
  try {
    fs.accessSync('/dev/kvm', fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

const defaultTimeout = hasUsableKvm() ? 180000 : 600000;
const configuredTimeout = Number(process.env.ZENZY_DETOX_TEST_TIMEOUT_MS ?? defaultTimeout);

if (!Number.isFinite(configuredTimeout) || configuredTimeout < 180000) {
  throw new Error('ZENZY_DETOX_TEST_TIMEOUT_MS must be a finite number >= 180000.');
}

module.exports = {
  rootDir: '../../..',
  testMatch: ['<rootDir>/phase1a/mobile-sim/e2e/**/*.detox.js'],
  testTimeout: configuredTimeout,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};