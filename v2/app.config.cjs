module.exports = ({ config }) => {
  if (process.env.ZENZY_DETOX !== '1') return config;

  const packageName = process.env.ZENZY_ANDROID_PACKAGE?.trim();
  if (!packageName) {
    throw new Error('ZENZY_ANDROID_PACKAGE is required when ZENZY_DETOX=1.');
  }

  return {
    ...config,
    android: {
      ...config.android,
      package: packageName,
    },
  };
};
