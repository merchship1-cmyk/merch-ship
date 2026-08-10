import {
  MERCH_SHIP_ARTIFACT_TYPES,
  type MerchShipArtifact,
  type MerchShipArtifactType,
} from '../schemas/artifact.schema';
import {
  hasExactKeys,
  isPlainRecord,
  isUnixMilliseconds,
  isUuid,
} from './shared.validator';

const ARTIFACT_KEYS = ['id', 'type', 'content', 'generatedAt'] as const;
const ARTIFACT_TYPE_SET = new Set<string>(MERCH_SHIP_ARTIFACT_TYPES);

function isArtifactType(value: unknown): value is MerchShipArtifactType {
  return typeof value === 'string' && ARTIFACT_TYPE_SET.has(value);
}

export function validateArtifact(value: unknown): value is MerchShipArtifact {
  if (!isPlainRecord(value) || !hasExactKeys(value, ARTIFACT_KEYS)) {
    return false;
  }

  return (
    isUuid(value.id) &&
    isArtifactType(value.type) &&
    isPlainRecord(value.content) &&
    isUnixMilliseconds(value.generatedAt)
  );
}
