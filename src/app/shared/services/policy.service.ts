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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, from, lastValueFrom} from 'rxjs';
import {expandArray, PolicyDefinition, QuerySpec, EDC_CONTEXT, JSON_LD_DEFAULT_CONTEXT} from "@think-it-labs/edc-connector-client";
import {PolicyDefinitionInput} from "../models/edc-connector-entities"
import { environment } from 'src/environments/environment';
import { CONTEXTS } from '../utils/app.constants';


@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private readonly BASE_URL = `${environment.runtime.managementApiUrl}${environment.runtime.service.policy.baseUrl}`;

  constructor(private http: HttpClient) {
  }

  /**
   * Creates a new policy definition
   * @param input
   */
  public createPolicy(input: PolicyDefinitionInput): Observable<any> {

    let body = {
      ...input,
      "@context": {
        "@vocab": EDC_CONTEXT,
        "odrl": CONTEXTS.odrl
      }
    }

    return from(lastValueFrom(this.http.post<PolicyDefinition>(
      `${this.BASE_URL}`, body
    )));
  }

  /**
   * Removes a policy definition with the given ID if possible. Deleting a policy definition is only possible if that policy definition is not yet referenced by a contract definition, in which case an error is returned. DANGER ZONE: Note that deleting policy definitions can have unexpected results, do this at your own risk!
   * @param id
   */
  public deletePolicy(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling deletePolicy.');
    }
    return from(lastValueFrom(this.http.delete<PolicyDefinition>(
      `${this.BASE_URL}${environment.runtime.service.policy.get}${id}`
    )));
  }

  /**
   * Gets a policy definition with the given ID
   * @param id
   */
  public getPolicy(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling getPolicy.');
    }

    return from(lastValueFrom(this.http.get<PolicyDefinition>(
      `${this.BASE_URL}${environment.runtime.service.policy.get}${id}`
    )));
  }

  /**
   * Returns all policy definitions according to a query
   * @param QuerySpec
   **/
  public queryAllPolicies(querySpec?: QuerySpec): Observable<Array<PolicyDefinition>> {
    let body;

    if(querySpec){
      body = {
        ...querySpec,
        "@context": JSON_LD_DEFAULT_CONTEXT,
      }
    }

    return from(lastValueFrom(this.http.post<Array<PolicyDefinition>>(
      `${this.BASE_URL}${environment.runtime.service.policy.getAll}`, body
    )).then(results => {
      return expandArray(results, () => new PolicyDefinition());
    }));
  }

  /**
   * Gets the total number of policies
   */
  public count(): Observable<number> {
    return from(lastValueFrom(this.http.get<number>(
      `${environment.runtime.managementApiUrl}${environment.runtime.service.policy.count}`
    )));
  }
}
