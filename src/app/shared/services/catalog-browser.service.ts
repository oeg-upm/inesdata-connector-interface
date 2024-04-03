import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';
import { Catalog } from '../models/catalog';
import { ContractOffer } from '../models/contract-offer';
import { DataOffer } from '../models/data-offer';
import { ContractNegotiationService } from './contractNegotiation.service';
import { TransferProcessService } from './transferProcess.service';

import { CONNECTOR_CATALOG_API, CONNECTOR_MANAGEMENT_API } from "../utils/app.constants";

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

  getDataOffers(): Observable<DataOffer[]> {
    let url = this.catalogApiUrl || this.managementApiUrl;
    return this.post<Catalog[]>(url)
      .pipe(map(catalogs => catalogs.map(catalog => {
        const arr = Array<DataOffer>();
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
          const contractOffers = Array<ContractOffer>();

          if (Array.isArray(hasPolicy)) {
            for (const offer of hasPolicy) {
              const policy = this.createPolicy(offer);
              const newContractOffer = this.createContractOffer(assetId, offer["@id"], policy);
              contractOffers.push(newContractOffer);
            }
          } else {
            const policy = this.createPolicy(hasPolicy);
              const newContractOffer = this.createContractOffer(assetId, hasPolicy["@id"], policy);
              contractOffers.push(newContractOffer);
          }

          const dataOffer = {
            assetId: assetId,
            properties: properties,
            "dcat:dataset": datasets,
            service: catalog["http://www.w3.org/ns/dcat#service"],
            contractOffers: contractOffers,
            originator: catalog["originator"],
          }

          arr.push(dataOffer);
        }
        return arr;
      })), reduce((acc, val) => {
        for (const subArray of val) {
          for (const item of subArray) {
            acc.push(item);
          }
        }
        return acc;
      }, new Array<DataOffer>()));
  }

  private createContractOffer(assetId: string, id: string, policy: PolicyInput): ContractOffer{
    return {
      assetId: assetId,
      id: id,
      policy: policy
    };
  }

  private createPolicy(offer: any): PolicyInput{
    return {
      "@type": "set",
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      uid: offer["@id"],
      assignee: offer["assignee"],
      assigner: offer["assigner"],
      obligation: offer["odrl:obligation"],
      permission: offer["odrl:permission"],
      prohibition: offer["odrl:prohibition"],
      target: offer["odrl:target"],
    };
  }

  initiateTransfer(transferRequest: TransferProcessInput): Observable<string> {
    return this.transferProcessService.initiateTransfer(transferRequest).pipe(map(t => t.id))
  }

  getTransferProcessesById(id: string): Observable<TransferProcess> {
    return this.transferProcessService.getTransferProcess(id);
  }

  initiateNegotiation(initiate: ContractNegotiationRequest): Observable<string> {
    return this.negotiationService.initiateContractNegotiation(initiate).pipe(map(t => t.id))
  }

  getNegotiationState(id: string): Observable<ContractNegotiation> {
    return this.negotiationService.getNegotiation(id);
  }

  private post<T>(urlPath: string,
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
    : Observable<T> {
    const url = `${urlPath}`;
    let headers = new HttpHeaders({ "Content-type": "application/json" });
    return this.catchError(this.httpClient.post<T>(url, "{\"edc:operandLeft\": \"\",\"edc:operandRight\": \"\",\"edc:operator\": \"\",\"edc:Criterion\":\"\"}", { headers, params }), url, 'POST');
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
