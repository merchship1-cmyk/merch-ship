import {
  MERCH_SHIP_ROUTING_TABLE,
  type MerchShipSignalType,
  type MerchShipTrackName,
} from './routing.table';

export function isMerchShipSignalType(
  value: unknown,
): value is MerchShipSignalType {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(MERCH_SHIP_ROUTING_TABLE, value)
  );
}

export function resolveTrack(signalType: unknown): MerchShipTrackName | null {
  if (!isMerchShipSignalType(signalType)) {
    return null;
  }

  return MERCH_SHIP_ROUTING_TABLE[signalType];
}
