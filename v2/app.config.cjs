module.exports = ({ config }) => {
  if (process.env.ZENZY_DETOX !== '1') return config;

  const packageName =
    process.env.ZENZY_ANDROID_PACKAGE?.trim() ?? 'com.merchship.zenzy.phase1a.test';

  return {
    ...config,
    android: {
      ...config.android,
      package: packageName,
    },
  };
};
