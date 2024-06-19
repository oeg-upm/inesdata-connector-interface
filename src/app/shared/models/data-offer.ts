import { DataService } from "./data-service";
import { Policy } from './edc-connector-entities';

export interface DataOffer {
  assetId: string;
  properties: any;
  endpointUrl: string;
  contractOffers: Policy[];
  originator: string;
}
