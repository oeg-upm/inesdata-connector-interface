import {Permission, Duty, Prohibition} from "./edc-connector-entities";

export interface PolicyElement {
  "@id": string;
  assignee: string;
  assigner: string;
  "odrl:obligations": Duty[];
  "odrl:permissions": Permission[];
  "odrl:prohibitions": Prohibition[];
  "odrl:target": string;
}
