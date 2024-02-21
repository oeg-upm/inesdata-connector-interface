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

  getContractOffersFromConnector(): Observable<ContractOffer[]> {
    let url = this.catalogApiUrl || this.managementApiUrl;
    return this.post<Catalog>(url + "/v2/catalog/request").pipe(
      map(catalog => {
        const arr: ContractOffer[] = [];
        let datasets = catalog["dcat:dataset"];

        if (!Array.isArray(datasets)) {
          datasets = [datasets];
        }

        datasets.forEach(dataSet => {
          const properties: { [key: string]: string } = {
            id: dataSet["id"],
            name: dataSet["name"],
            version: dataSet["version"],
            type: dataSet["type"],
            contentType: dataSet["contenttype"]
          };

          const assetId = dataSet["@id"];
          const hasPolicy = dataSet["odrl:hasPolicy"];



          hasPolicy.forEach((element: PolicyElement) => {
            const policy: PolicyInput = {
              "@type": "set",
              "@context": "http://www.w3.org/ns/odrl.jsonld",
              "uid": element["@id"],
              "assignee": element["assignee"],
              "assigner": element["assigner"],
              "obligation": element["odrl:obligations"],
              "permission": element["odrl:permissions"],
              "prohibition": element["odrl:prohibitions"],
              "target": element["odrl:target"]
            };

            const newContractOffer: ContractOffer = {
              assetId: assetId,
              properties: properties,
              id: hasPolicy["@id"],
              originator: catalog["edc:originator"] ?? catalog["dcat:service"]["endpointUrl"],
              policy: policy
            };

            arr.push(newContractOffer);
          });
        });

        return arr;
      })
    );
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
    const fetchCatalogData = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
      },
      "counterPartyAddress": "http://localhost:19194/protocol",
      "protocol": "dataspace-protocol-http"
    };
    let headers = new HttpHeaders({"Content-type": "application/json"});
    //return this.catchError(this.httpClient.post<T>(url, "{\"edc:operandLeft\": \"\",\"edc:operandRight\": \"\",\"edc:operator\": \"\",\"edc:Criterion\":\"\"}", {headers, params}), url, 'POST');
    return this.catchError(this.httpClient.post<T>(url, fetchCatalogData, {headers, params}), url, 'POST');
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
