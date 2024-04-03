import { DataService } from "./data-service";
import { ContractOffer } from './contract-offer';

export interface DataOffer {
  assetId: string;
  properties: any;
  "dcat:dataset": Array<any>;
  service: DataService;
  contractOffers: ContractOffer[];
  originator: string;
}
