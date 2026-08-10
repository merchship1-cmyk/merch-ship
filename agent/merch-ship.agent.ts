import type { MerchShipTrackName } from '../routing/routing.table';
import { resolveTrack } from '../routing/routing.validator';
import { MERCH_SHIP_STAGE_DEFINITIONS } from '../stages/stage.definitions';
import { validateSignal } from '../validators/signal.validator';

export interface InertRouteDecision {
  readonly status: 'INERT';
  readonly track: MerchShipTrackName;
  readonly stageIds: readonly string[];
}

export class MerchShipAgent {
  route(value: unknown): InertRouteDecision | null {
    if (!validateSignal(value)) {
      return null;
    }

    const track = resolveTrack(value.type);
    if (track === null) {
      return null;
    }

    return {
      status: 'INERT',
      track,
      stageIds: MERCH_SHIP_STAGE_DEFINITIONS[track].map((stage) => stage.id),
    };
  }
}
