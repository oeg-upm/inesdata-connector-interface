import { ContractOffer } from './contract-offer';
import { DataService } from './data-service';


export interface Asset {
  id?: string;
  name: string;
  contentType: string;
  contractOffers?: Array<ContractOffer>;
  "dcat:dataset": Array<any>;
}
