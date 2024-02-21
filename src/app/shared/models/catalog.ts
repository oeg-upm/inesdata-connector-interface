import { Asset } from './asset';
import { DataService } from "./data-service";

export interface Catalog {
    id?: string;
    assets?: Array<Asset>;
    "dcat:dataset": Array<any>;
    "dcat:service": DataService;
    "edc:originator"?: string;
}
