import { requiredFields, slugify, ensureArray } from '../../utils/validation.js';

export const moduleDefinition = {
  id: 'PRODUCT_FACTORY',
  lane: 'factory',
  purpose: 'Generate digital products, format assets, prepare metadata, and create distribution manifests.'
};

export const createProductSpec = (input) => {
  const required = requiredFields(input, ['title', 'format', 'audience']);
  if (!required.valid) {
    return { status: 'blocked', errors: [`Missing required product fields: ${required.missing.join(', ')}`] };
  }

  const slug = slugify(input.slug || input.title);
  const version = input.version || '0.1.0';

  return {
    status: 'prepared',
    product: {
      id: `ms-${slug}`,
      title: input.title,
      slug,
      format: input.format,
      audience: input.audience,
      version,
      assets: ensureArray(input.assets),
      metadata: {
        tags: ensureArray(input.tags),
        createdBy: 'PRODUCT_FACTORY',
        distributionReady: ensureArray(input.assets).length > 0
      },
      distributionManifest: {
        packageName: `${slug}-v${version}`,
        requiredFiles: ['README.md', 'LICENSE.md', 'product.json', ...ensureArray(input.assets)],
        channels: ensureArray(input.channels).length ? ensureArray(input.channels) : ['shopify', 'direct-download']
      }
    }
  };
};
