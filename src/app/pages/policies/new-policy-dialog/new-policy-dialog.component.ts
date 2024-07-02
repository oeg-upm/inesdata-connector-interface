import { Component, OnInit } from '@angular/core';
import { PolicyInput } from "../../../shared/models/edc-connector-entities";
import { MatDialogRef } from "@angular/material/dialog";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PolicyBuilder } from '@think-it-labs/edc-connector-client';

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent implements OnInit {
  editMode: boolean = false;
  policy: PolicyInput = {
    "@type": "Set"
  };

  policyId: string = '';
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
      this.policy.permission = this.parseAndVerifyJson(this.permissionsJson);
      this.policy.prohibition = this.parseAndVerifyJson(this.prohibitionsJson);
      this.policy.obligation = this.parseAndVerifyJson(this.obligationsJson);

      this.dialogRef.close({
        '@id': this.policyId,
        policy: new PolicyBuilder()
        .raw({
          ...this.policy
        })
        .build()
      });

    } catch (error) {
      if (error instanceof SyntaxError) {
        this.notificationService.showError("Error parsing JSON: " + error.message);
        console.error(error);
      }
    }
  }

  /**
   * Parse and verify a JSON from the policy
   *
   * @param json JSON to parse and verify
   * @returns the parsed JSON or null if it is empty
   */
  private parseAndVerifyJson(json: string): any {
    if (json.trim() != '') {
      const parsedJson = JSON.parse(json);
      return parsedJson;
    }

    return null;
  }

}
