import { Component, OnInit } from '@angular/core';
import { PolicyDefinitionInput, PolicyInput } from "../../../shared/models/edc-connector-entities";
import { MatDialogRef } from "@angular/material/dialog";
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent implements OnInit {
  editMode: boolean = false;
  policy: PolicyInput = {
    "@type": "set"
  };
  policyDefinition: PolicyDefinitionInput = {
    "policy": this.policy,
    "@id": ''
  };
  permissionsJson: string = '';
  prohibitionsJson: string = '';
  obligationsJson: string = '';

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>,
    private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.editMode = true;
  }

  onSave() {
    try {
      this.policy.permission = this.parseAndVerifyJson(this.permissionsJson, "Permissions");
      this.policy.prohibition = this.parseAndVerifyJson(this.prohibitionsJson, "Prohibitions");
      this.policy.obligation = this.parseAndVerifyJson(this.obligationsJson, "Obligations");

      this.policy["@context"] = "http://www.w3.org/ns/odrl.jsonld";

      this.dialogRef.close({
        policy: this.policyDefinition.policy,
        '@id': this.policyDefinition.id
      });

    } catch (error) {
      if (error instanceof SyntaxError) {
        this.notificationService.showError("Error parsing JSON: " + error.message);
        console.error(error);
      }
      if (error instanceof VerifyJsonKeysError) {
        this.notificationService.showError(error.message);
        console.error(error);
      }
    }
  }

  /**
   * Parse and verify a JSON from the policy
   *
   * @param json JSON to parse and verify
   * @param property property of the policy which containst the JSON to verify (permissions, prohibitons or obligations)
   * @returns the parsed JSON or null if it is empty
   */
  private parseAndVerifyJson(json: string, property: string): any {
    if (json.trim() != '') {
      const parsedJson = JSON.parse(json);
      let requiredKeys = ["target", "action"];
      let allowedKeys = [...requiredKeys, "constraint", "duty"];

      if (property === 'Obligations') {
        allowedKeys = [...requiredKeys, "constraint"];
        requiredKeys = [];
      }

      if (!this.verifyKeys(parsedJson, requiredKeys, allowedKeys)) {
        throw new VerifyJsonKeysError(property + ' JSON is not valid');
      }

      return parsedJson;
    }

    return null;
  }

  /**
   * Checks if a JSON has the required keys and if it has invalid keys
   *
   * @param json the JSON to verify
   * @param requiredKeys requiered keys that must be included in the JSON
   * @param allowedKeys allowed keys that may be included in the JSON
   * @returns true if keys are valid, false otherwise
   */
  private verifyKeys(json: any, requiredKeys: string[], allowedKeys: string[]): boolean {
    const keysFromJson = Object.keys(json);

    if (requiredKeys.length > 0) {
      for (const key of requiredKeys) {
        if (!keysFromJson.includes(key)) {
          return false;
        }
      }
    }

    for (const key of keysFromJson) {
      if (!allowedKeys.includes(key)) {
        return false;
      }
    }

    return true;
  }

}

/**
 * Error class to throw when JSON keys are wrong
 */
class VerifyJsonKeysError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, VerifyJsonKeysError.prototype);
  }
}
