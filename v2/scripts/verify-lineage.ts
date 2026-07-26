import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve('..');
const lineage = JSON.parse(
  readFileSync(resolve('governance/lineage.json'), 'utf8'),
) as {
  successor?: { path?: string };
  predecessor?: { path?: string; manifest?: string };
};

if (
  lineage.successor?.path !== 'v2/' ||
  lineage.predecessor?.path !== 'todo-app/' ||
  lineage.predecessor?.manifest !==
    'governance/heritage/Z-001-v1.git-blobs'
) {
  throw new Error('Component lineage does not preserve the Z-001 boundary.');
}

const manifestPath = resolve(
  repoRoot,
  lineage.predecessor.manifest,
);
const manifest = readFileSync(manifestPath, 'utf8');

for (const line of manifest.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    continue;
  }

  const [expected, path] = trimmed.split(/\s+/, 2);
  const content = readFileSync(resolve(repoRoot, path));
  const header = Buffer.from('blob ' + content.length + '\0');
  const actual = createHash('sha1')
    .update(header)
    .update(content)
    .digest('hex');

  if (actual !== expected) {
    throw new Error('Heritage drift detected at ' + path + '.');
  }
}

console.log('Z-001 v1 heritage lineage is intact.');
