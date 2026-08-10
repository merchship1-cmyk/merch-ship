import type { MerchShipTrack } from '../schemas/track.schema';
import {
  MERCH_SHIP_ROUTING_TABLE,
  type MerchShipTrackName,
} from '../routing/routing.table';
import { validateStage } from './stage.validator';
import {
  hasExactKeys,
  isNonEmptyString,
  isPlainRecord,
} from './shared.validator';

const TRACK_KEYS = ['id', 'name', 'stages'] as const;
const TRACK_NAME_SET = new Set<string>(
  Object.values(MERCH_SHIP_ROUTING_TABLE),
);

export function validateTrack(value: unknown): value is MerchShipTrack {
  if (!isPlainRecord(value) || !hasExactKeys(value, TRACK_KEYS)) {
    return false;
  }

  if (
    !isNonEmptyString(value.id) ||
    !isTrackName(value.name) ||
    !Array.isArray(value.stages) ||
    value.stages.length === 0 ||
    !value.stages.every(validateStage)
  ) {
    return false;
  }

  const stageIds = value.stages.map((stage) => stage.id);
  return new Set(stageIds).size === stageIds.length;
}

function isTrackName(value: unknown): value is MerchShipTrackName {
  return typeof value === 'string' && TRACK_NAME_SET.has(value);
}
