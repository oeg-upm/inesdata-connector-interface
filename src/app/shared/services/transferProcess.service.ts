/**
 * EDC REST API
 * EDC REST APIs - merged by OpenApiMerger
 *
 * The version of the OpenAPI document: 0.0.1-SNAPSHOT
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, lastValueFrom } from 'rxjs';
import { TransferProcessInput, QuerySpec } from "../models/edc-connector-entities";
import { environment } from 'src/environments/environment';
import { expand, IdResponse, JSON_LD_DEFAULT_CONTEXT, TransferProcess, TransferProcessState } from '@think-it-labs/edc-connector-client';

@Injectable({
  providedIn: 'root'
})
export class TransferProcessService {
  private readonly BASE_URL = `${environment.runtime.managementApiUrl}${environment.runtime.service.transferProcess.baseUrl}`;

  constructor(private http: HttpClient) {
  }

  /**
   * Requests aborting the transfer process. Due to the asynchronous nature of transfers, a successful response only indicates that the request was successfully received. Clients must poll the /{id}/state endpoint to track the state.
   * @param id
   */
  public cancelTransferProcess(id: string): Observable<any> {
    let body = {
      reason: "Call by DataDashboard.",
      "@id": id,
      "@context": JSON_LD_DEFAULT_CONTEXT,
    }

    return from(lastValueFrom(this.http.post<any>(
      `${this.BASE_URL}${environment.runtime.service.transferProcess.get}${id}${environment.runtime.service.transferProcess.terminate}`, body
    )));
  }

  /**
   * Requests the deprovisioning of resources associated with a transfer process. Due to the asynchronous nature of transfers, a successful response only indicates that the request was successfully received. This may take a long time, so clients must poll the /{id}/state endpoint to track the state.
   * @param id
   */
  public deprovisionTransferProcess(id: string): Observable<any> {
    let body = {
      "@id": id,
      "@context": JSON_LD_DEFAULT_CONTEXT,
    }

    return from(lastValueFrom(this.http.post<any>(
      `${this.BASE_URL}${environment.runtime.service.transferProcess.get}${id}${environment.runtime.service.transferProcess.deprovision}`, body
    )));
  }

  /**
   * Gets a transfer process with the given ID
   * @param id
   */
  public getTransferProcess(id: string): Observable<any> {
    return from(lastValueFrom(this.http.get<TransferProcess>(
      `${this.BASE_URL}${environment.runtime.service.transferProcess.get}${id}`
    )).then(result => {
      return expand(result, () => new TransferProcess());
    }));
  }

  /**
   * Gets the state of a transfer process with the given ID
   * @param id
   */
  public getTransferProcessState(id: string): Observable<any> {
    return from(lastValueFrom(this.http.get<TransferProcessState>(
      `${this.BASE_URL}${id}${environment.runtime.service.transferProcess.state}`
    )).then(result => {
      return expand(result, () => new TransferProcessState());
    }));
  }

  /**
   * Initiates a data transfer with the given parameters. Please note that successfully invoking this endpoint only means that the transfer was initiated. Clients must poll the /{id}/state endpoint to track the state
   * @param transferRequestInput
   */
  public initiateTransfer(transferRequestInput: TransferProcessInput): Observable<any> {
    let body = {
      protocol: "dataspace-protocol-http",
      "@context": JSON_LD_DEFAULT_CONTEXT,
      ...transferRequestInput
    }

    return from(lastValueFrom(this.http.post<any>(
      `${this.BASE_URL}`, body
    )).then(result => {
      return expand(result, () => new IdResponse());
    }));
  }

  /**
   * Returns all transfer process according to a query
   * @param querySpec
   */
  public queryAllTransferProcesses(querySpec?: QuerySpec): Observable<any> {
    let body =
      querySpec === undefined || querySpec === null || Object.keys(querySpec).length === 0
        ? null
        : {
          ...querySpec,
          "@context": JSON_LD_DEFAULT_CONTEXT,
        }

    return from(lastValueFrom(this.http.post<TransferProcess>(
      `${this.BASE_URL}${environment.runtime.service.transferProcess.getAll}`, body
    )));
  }


  /**
  * Gets the total number of transfers
  */
  public count(): Observable<number> {
    const querySpec: QuerySpec = {
      filterExpression: []
    }

    const body = {
      "@context": JSON_LD_DEFAULT_CONTEXT,
      ...querySpec
    };

    return from(lastValueFrom(this.http.post<number>(
      `${environment.runtime.managementApiUrl}${environment.runtime.service.transferProcess.count}`, body
    )));
  }
}
