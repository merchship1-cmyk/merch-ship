import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const v2Root = resolve(here, '../..');
const packageName = process.env.ZENZY_ANDROID_PACKAGE?.trim();
if (!packageName) {
  throw new Error('ZENZY_ANDROID_PACKAGE is required for the temporary Detox native build.');
}

const rootBuildGradle = resolve(v2Root, 'android/build.gradle');
const appBuildGradle = resolve(v2Root, 'android/app/build.gradle');
const manifestPath = resolve(v2Root, 'android/app/src/main/AndroidManifest.xml');

let rootGradle = readFileSync(rootBuildGradle, 'utf8');
if (!rootGradle.includes('node_modules/detox/Detox-android')) {
  rootGradle += `\nallprojects {\n    repositories {\n        maven { url "$rootDir/../node_modules/detox/Detox-android" }\n    }\n}\n`;
  writeFileSync(rootBuildGradle, rootGradle, 'utf8');
}

let appGradle = readFileSync(appBuildGradle, 'utf8');
if (!appGradle.includes('testBuildType System.getProperty')) {
  appGradle = appGradle.replace(
    /defaultConfig\s*\{/,
    (match) =>
      `${match}\n        testBuildType System.getProperty('testBuildType', 'debug')\n        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'`,
  );
}
if (!appGradle.includes("androidTestImplementation('com.wix:detox:+')")) {
  appGradle += `\ndependencies {\n    androidTestImplementation('com.wix:detox:+') { transitive = true }\n}\n`;
}
writeFileSync(appBuildGradle, appGradle, 'utf8');

let manifest = readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:networkSecurityConfig=')) {
  manifest = manifest.replace(
    '<application',
    '<application android:networkSecurityConfig="@xml/network_security_config"',
  );
  writeFileSync(manifestPath, manifest, 'utf8');
}

const networkConfigPath = resolve(
  v2Root,
  'android/app/src/main/res/xml/network_security_config.xml',
);
mkdirSync(dirname(networkConfigPath), { recursive: true });
writeFileSync(
  networkConfigPath,
  `<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n  <domain-config cleartextTrafficPermitted="true">\n    <domain includeSubdomains="true">localhost</domain>\n    <domain includeSubdomains="true">10.0.2.2</domain>\n  </domain-config>\n</network-security-config>\n`,
  'utf8',
);

const javaPath = resolve(
  v2Root,
  'android/app/src/androidTest/java',
  ...packageName.split('.'),
  'DetoxTest.java',
);
mkdirSync(dirname(javaPath), { recursive: true });
writeFileSync(
  javaPath,
  `package ${packageName};\n\nimport com.wix.detox.Detox;\nimport com.wix.detox.config.DetoxConfig;\nimport org.junit.Rule;\nimport org.junit.Test;\nimport org.junit.runner.RunWith;\nimport androidx.test.ext.junit.runners.AndroidJUnit4;\nimport androidx.test.filters.LargeTest;\nimport androidx.test.rule.ActivityTestRule;\n\n@RunWith(AndroidJUnit4.class)\n@LargeTest\npublic class DetoxTest {\n    @Rule\n    public ActivityTestRule<MainActivity> mActivityRule =\n        new ActivityTestRule<>(MainActivity.class, false, false);\n\n    @Test\n    public void runDetoxTests() {\n        DetoxConfig detoxConfig = new DetoxConfig();\n        detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;\n        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;\n        detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 180 : 60);\n        Detox.runTests(mActivityRule, detoxConfig);\n    }\n}\n`,
  'utf8',
);

console.log('Temporary Android Detox instrumentation installed.');
