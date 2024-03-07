import { ContractOffer } from './contract-offer';

export interface Asset {
  id?: string;
  name: string;
  contentType: string;
  contractOffers?: Array<ContractOffer>;
  "dcat:dataset": Array<any>;
}
