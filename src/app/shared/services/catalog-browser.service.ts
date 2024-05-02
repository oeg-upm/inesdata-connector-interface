import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';
import { DataOffer } from '../models/data-offer';
import { ContractNegotiationService } from './contractNegotiation.service';
import { TransferProcessService } from './transferProcess.service';
import { environment } from "src/environments/environment";

import {
  ContractNegotiationRequest,
  ContractNegotiation,
  TransferProcess,
  TransferProcessInput,
  Policy,
} from "../models/edc-connector-entities";
import { PolicyBuilder } from '@think-it-labs/edc-connector-client';



/**
 * Combines several services that are used from the {@link CatalogBrowserComponent}
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogBrowserService {

  private readonly BASE_URL = `${environment.runtime.catalogUrl}`;

  constructor(private httpClient: HttpClient,
    private transferProcessService: TransferProcessService,
    private negotiationService: ContractNegotiationService) {
  }

  getDataOffers(): Observable<DataOffer[]> {
    return this.post<Array<any>>(`${this.BASE_URL}`)
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
          const contractOffers = Array<Policy>();

          if (Array.isArray(hasPolicy)) {
            for (const offer of hasPolicy) {

              const contractOffer = new PolicyBuilder()
              .raw({
                ...offer,
                assigner: catalog.participantId,
                target: assetId
              })
              .build();

              contractOffers.push(contractOffer);
            }
          } else {

            const contractOffer = new PolicyBuilder()
              .raw({
                ...hasPolicy,
                assigner: catalog.participantId,
                target: assetId
              })
              .build();

              contractOffers.push(contractOffer);
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
