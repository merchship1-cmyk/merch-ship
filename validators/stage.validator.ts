import type { MerchShipStage } from '../schemas/stage.schema';
import {
  hasExactKeys,
  isNonEmptyString,
  isPlainRecord,
  isUniqueNonEmptyStringArray,
} from './shared.validator';

const STAGE_KEYS = [
  'id',
  'name',
  'description',
  'inputs',
  'outputs',
] as const;

const STAGE_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export function validateStage(value: unknown): value is MerchShipStage {
  if (!isPlainRecord(value) || !hasExactKeys(value, STAGE_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    STAGE_ID_PATTERN.test(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    isUniqueNonEmptyStringArray(value.inputs) &&
    isUniqueNonEmptyStringArray(value.outputs)
  );
}
