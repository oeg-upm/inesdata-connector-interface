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
import { expandArray, ContractDefinition, JSON_LD_DEFAULT_CONTEXT } from '@think-it-labs/edc-connector-client';
import { QuerySpec, ContractDefinitionInput } from "../models/edc-connector-entities"
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ContractDefinitionService {

  private readonly BASE_URL = `${environment.runtime.managementApiUrl}${environment.runtime.service.contractDefinition.baseUrl}`;

  constructor(private http: HttpClient) {
  }

  /**
   * Creates a new contract definition
   * @param input
   **/
  public createContractDefinition(input: ContractDefinitionInput): Observable<any> {
    let body = {
      ...input,
      "@context": JSON_LD_DEFAULT_CONTEXT,
    }

    return from(lastValueFrom(this.http.post<ContractDefinitionInput>(
      `${this.BASE_URL}`, body
    )));
  }

  /**
   * Removes a contract definition with the given ID if possible. DANGER ZONE: Note that deleting contract definitions can have unexpected results, especially for contract offers that have been sent out or ongoing or contract negotiations.
   * @param id
   */
  public deleteContractDefinition(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling deleteContractDefinition.');
    }

    return from(lastValueFrom(this.http.delete<ContractDefinitionInput>(
      `${this.BASE_URL}${environment.runtime.service.contractDefinition.get}${id}`
    )));
  }

  /**
   * Gets an contract definition with the given ID
   * @param id
   */
  public getContractDefinition(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling getContractDefinition.');
    }

    return from(lastValueFrom(this.http.get<ContractDefinitionInput>(
      `${this.BASE_URL}${environment.runtime.service.contractDefinition.get}${id}`
    )));
  }

  /**
   * Returns all contract definitions according to a query
   * @param querySpec
   */
  public queryAllContractDefinitions(querySpec?: QuerySpec): Observable<Array<ContractDefinition>> {
    let body;

    if (querySpec) {
      body = {
        ...querySpec,
        "@context": JSON_LD_DEFAULT_CONTEXT,
      }
    }

    return from(lastValueFrom(this.http.post<Array<ContractDefinition>>(
      `${this.BASE_URL}${environment.runtime.service.contractDefinition.getAll}`, body
    )).then(results => {
      return expandArray(results, () => new ContractDefinition());
    }));
  }

  /**
   * Gets the total number of contract definitions
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
      `${environment.runtime.managementApiUrl}${environment.runtime.service.contractDefinition.count}`, body
    )));
  }
}
