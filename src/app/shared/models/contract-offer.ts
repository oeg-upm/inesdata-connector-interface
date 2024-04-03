import {PolicyInput} from "./edc-connector-entities";

export interface ContractOffer {
  id: string;
  assetId: string;
  policy: PolicyInput;
}
