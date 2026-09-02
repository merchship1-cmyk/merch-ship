/** @type {import('detox').Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'phase1a/mobile-sim/e2e/jest.config.cjs',
    },
    jest: {
      setupTimeout: 180000,
    },
  },
  apps: {
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: process.env.DETOX_AVD_NAME || 'zenzy_api_34',
      },
    },
  },
  configurations: {
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
