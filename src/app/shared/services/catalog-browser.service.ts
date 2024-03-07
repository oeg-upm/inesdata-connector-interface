import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {catchError, map, reduce} from 'rxjs/operators';
import {Catalog} from '../models/catalog';
import {ContractOffer} from '../models/contract-offer';
import {PolicyElement} from '../models/policy';
import {ContractNegotiationService} from './contractNegotiation.service';
import {TransferProcessService} from './transferProcess.service';

import {CONNECTOR_CATALOG_API, CONNECTOR_MANAGEMENT_API} from "../utils/app.constants";

import {
  ContractNegotiationRequest,
  ContractNegotiation,
  PolicyInput,
  TransferProcess,
  TransferProcessInput,
} from "../models/edc-connector-entities";



/**
 * Combines several services that are used from the {@link CatalogBrowserComponent}
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogBrowserService {

  constructor(private httpClient: HttpClient,
              private transferProcessService: TransferProcessService,
              private negotiationService: ContractNegotiationService,
              @Inject(CONNECTOR_MANAGEMENT_API) private managementApiUrl: string,
              @Inject(CONNECTOR_CATALOG_API) private catalogApiUrl: string) {
  }

  getContractOffers(): Observable<ContractOffer[]> {
    let url = this.catalogApiUrl || this.managementApiUrl;
    return this.post<Catalog[]>(url)
      .pipe(map(catalogs => catalogs.map(catalog => {
        const arr = Array<ContractOffer>();
        let datasets = catalog["http://www.w3.org/ns/dcat#dataset"];
        if (!Array.isArray(datasets)) {
          datasets = [datasets];
        }

        for (const dataset of datasets) {
          const properties: { [key: string]: string; } = {
            id: dataset["id"],
            name: dataset["name"],
            version: dataset["version"],
            type: dataset["type"],
            contentType: dataset["contenttype"]
          }
          const assetId = dataset["@id"];

          const hasPolicy = dataset["odrl:hasPolicy"];
          const policy: PolicyInput = {
            "@type": "set",
            "@context": "http://www.w3.org/ns/odrl.jsonld",
            "uid": hasPolicy["@id"],
            "assignee": hasPolicy["assignee"],
            "assigner": hasPolicy["assigner"],
            "obligation": hasPolicy["odrl:obligations"],
            "permission": hasPolicy["odrl:permissions"],
            "prohibition": hasPolicy["odrl:prohibitions"],
            "target": hasPolicy["odrl:target"]
          };

          const newContractOffer: ContractOffer = {
            assetId: assetId,
            properties: properties,
            "dcat:service": catalog["dcat:service"],
            "dcat:dataset": datasets,
            id: hasPolicy["@id"],
            originator: catalog["originator"],
            policy: policy
          };

          arr.push(newContractOffer)
        }
        return arr;
      })), reduce((acc, val) => {
        for (const subArray of val) {
          for (const item of subArray) {
            acc.push(item);
          }
        }
        return acc;
      }, new Array<ContractOffer>()));
  }

  initiateTransfer(transferRequest: TransferProcessInput): Observable<string> {
    return this.transferProcessService.initiateTransfer(transferRequest).pipe(map(t => t.id!))
  }

  getTransferProcessesById(id: string): Observable<TransferProcess> {
    return this.transferProcessService.getTransferProcess(id);
  }

  initiateNegotiation(initiate: ContractNegotiationRequest): Observable<string> {
    return this.negotiationService.initiateContractNegotiation(initiate).pipe(map(t => t.id!))
  }

  getNegotiationState(id: string): Observable<ContractNegotiation> {
    return this.negotiationService.getNegotiation(id);
  }

  private post<T>(urlPath: string,
                  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
    : Observable<T> {
    const url = `${urlPath}`;
    let headers = new HttpHeaders({"Content-type": "application/json"});
    return this.catchError(this.httpClient.post<T>(url, "{\"edc:operandLeft\": \"\",\"edc:operandRight\": \"\",\"edc:operator\": \"\",\"edc:Criterion\":\"\"}", {headers, params}), url, 'POST');
  }

  private catchError<T>(observable: Observable<T>, url: string, method: string): Observable<T> {
    return observable
      .pipe(
        catchError((httpErrorResponse: HttpErrorResponse) => {
          if (httpErrorResponse.error instanceof Error) {
            console.error(`Error accessing URL '${url}', Method: 'GET', Error: '${httpErrorResponse.error.message}'`);
          } else {
            console.error(`Unsuccessful status code accessing URL '${url}', Method: '${method}', StatusCode: '${httpErrorResponse.status}', Error: '${httpErrorResponse.error?.message}'`);
          }

          return EMPTY;
        }));
  }
}
