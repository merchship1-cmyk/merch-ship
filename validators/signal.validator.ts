import type { MerchShipSignal } from '../schemas/signal.schema';
import { isMerchShipSignalType } from '../routing/routing.validator';
import {
  hasExactKeys,
  isPlainRecord,
  isUnixMilliseconds,
  isUuid,
} from './shared.validator';

const SIGNAL_KEYS = ['id', 'type', 'timestamp', 'payload'] as const;

export function validateSignal(value: unknown): value is MerchShipSignal {
  if (!isPlainRecord(value) || !hasExactKeys(value, SIGNAL_KEYS)) {
    return false;
  }

  return (
    isUuid(value.id) &&
    isMerchShipSignalType(value.type) &&
    isUnixMilliseconds(value.timestamp) &&
    isPlainRecord(value.payload)
  );
}
