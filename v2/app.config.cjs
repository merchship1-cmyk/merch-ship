module.exports = ({ config }) => {
  const detoxMode = process.env.ZENZY_DETOX === '1';
  const phase1bPreview = process.env.ZENZY_PHASE1B_PREVIEW === '1';

  if (!detoxMode && !phase1bPreview) return config;

  const androidPackage = detoxMode
    ? process.env.ZENZY_ANDROID_PACKAGE?.trim() ?? 'com.merchship.zenzy.phase1a.test'
    : 'com.merchship.zenzy.phase1b.preview';

  const easProjectId = process.env.ZENZY_EAS_PROJECT_ID?.trim();

  return {
    ...config,
    ...(phase1bPreview
      ? {
          name: 'Zenzy Preview',
          scheme: 'zenzy-preview',
          extra: {
            ...(config.extra ?? {}),
            ...(easProjectId
              ? {
                  eas: {
                    ...(config.extra?.eas ?? {}),
                    projectId: easProjectId,
                  },
                }
              : {}),
          },
          ios: {
            ...config.ios,
            bundleIdentifier: 'com.merchship.zenzy.phase1b.preview',
          },
        }
      : {}),
    android: {
      ...config.android,
      package: androidPackage,
    },
  };
};
