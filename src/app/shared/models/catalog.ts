import { Asset } from './asset';
import { DataService } from "./data-service";

export interface Catalog {
    id?: string;
    assets?: Array<Asset>;
    "http://www.w3.org/ns/dcat#dataset": Array<any>;
    "dcat:service": DataService;
    "originator": string;
    participantId: string;
}
