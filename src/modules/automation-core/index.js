export const moduleDefinition = {
  id: 'AUTOMATION_CORE',
  lane: 'automation',
  purpose: 'Run scheduled jobs, sync tasks, data pulls, and reporting pipelines.'
};

export const jobRegistry = [
  {
    id: 'commerce-drift-check',
    schedule: 'manual-or-hourly',
    module: 'SYNC.NODE.COMMERCE',
    description: 'Checks offer, proof, and delivery alignment before distribution.'
  },
  {
    id: 'product-manifest-audit',
    schedule: 'manual-or-daily',
    module: 'PRODUCT_FACTORY',
    description: 'Verifies product manifests include required distribution files.'
  }
];

export const listJobs = () => ({ status: 'ready', jobs: jobRegistry });
