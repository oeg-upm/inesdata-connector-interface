import { Criterion, CriterionInput } from "./criterion";
import { JsonLdId } from "./edc-connector-entities";
export declare class ContractDefinition extends JsonLdId {
    get accessPolicyId(): string;
    get contractPolicyId(): string;
    get assetsSelector(): Criterion[];
}
export interface ContractDefinitionInput {
    "@id"?: string;
    accessPolicyId: string;
    contractPolicyId: string;
    assetsSelector: CriterionInput[];
}
