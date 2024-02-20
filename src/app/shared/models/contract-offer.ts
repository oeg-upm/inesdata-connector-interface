import {PolicyInput} from "./edc-connector-entities";

export interface ContractOffer {
  id: string;
  policy: PolicyInput;
  originator: string;
  assetId: string;
  properties: any;
}
