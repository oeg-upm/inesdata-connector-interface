import { DataService } from "./data-service";
import { Policy } from './edc-connector-entities';

export interface DataOffer {
  assetId: string;
  properties: any;
  service: DataService;
  contractOffers: Policy[];
  originator: string;
}
