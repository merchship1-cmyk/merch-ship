/** @type {import('@jest/types').Config.InitialOptions} */
const configuredTimeout = Number(process.env.ZENZY_DETOX_TEST_TIMEOUT_MS ?? 180000);

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