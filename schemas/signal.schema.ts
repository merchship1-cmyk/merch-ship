import type { MerchShipSignalType } from '../routing/routing.table';

export interface MerchShipSignal {
  readonly id: string;
  readonly type: MerchShipSignalType;
  readonly timestamp: number;
  readonly payload: Readonly<Record<string, unknown>>;
}
