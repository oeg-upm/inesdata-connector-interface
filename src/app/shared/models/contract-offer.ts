import {PolicyInput} from "./edc-connector-entities";
import {DataService} from "./data-service";

export interface ContractOffer {
  id: string;
  assetId: string;
  properties: any;
  "dcat:dataset": Array<any>;
  "dcat:service": DataService;
  policy: PolicyInput;
  originator: string;
}
