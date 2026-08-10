export interface MerchShipStage {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
}
