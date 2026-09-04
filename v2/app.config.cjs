const { projectId: repositoryEasProjectId } = require('./eas-project.json');

module.exports = ({ config }) => {
  const detoxMode = process.env.ZENZY_DETOX === '1';
  const phase1bPreview = process.env.ZENZY_PHASE1B_PREVIEW === '1';
  const remoteInternalBeta = process.env.ZENZY_REMOTE_INTERNAL_BETA === '1';

  const activeModes = [detoxMode, phase1bPreview, remoteInternalBeta].filter(Boolean).length;
  if (activeModes > 1) {
    throw new Error('ZENZY build modes are mutually exclusive.');
  }

  if (activeModes === 0) return config;

  const internalPreviewMode = phase1bPreview || remoteInternalBeta;
  const androidPackage = detoxMode
    ? process.env.ZENZY_ANDROID_PACKAGE?.trim() ?? 'com.merchship.zenzy.phase1a.test'
    : remoteInternalBeta
      ? 'com.merchship.zenzy.internalbeta'
      : 'com.merchship.zenzy.phase1b.preview';

  const easProjectId =
    internalPreviewMode && typeof repositoryEasProjectId === 'string'
      ? repositoryEasProjectId.trim()
      : undefined;

  const internalIdentity = remoteInternalBeta
    ? {
        name: 'Zenzy Internal Beta',
        scheme: 'zenzy-internal-beta',
        bundleIdentifier: 'com.merchship.zenzy.internalbeta',
      }
    : {
        name: 'Zenzy Preview',
        scheme: 'zenzy-preview',
        bundleIdentifier: 'com.merchship.zenzy.phase1b.preview',
      };

  return {
    ...config,
    ...(internalPreviewMode
      ? {
          name: internalIdentity.name,
          scheme: internalIdentity.scheme,
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
            bundleIdentifier: internalIdentity.bundleIdentifier,
          },
        }
      : {}),
    android: {
      ...config.android,
      package: androidPackage,
    },
  };
};