import type { MerchShipTrackName } from '../routing/routing.table';
import type { MerchShipStage } from './stage.schema';

export interface MerchShipTrack {
  readonly id: string;
  readonly name: MerchShipTrackName;
  readonly stages: readonly MerchShipStage[];
}
