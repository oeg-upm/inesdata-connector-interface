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
              private notificationService: NotificationService,) {
  }

  ngOnInit(): void {
    this.editMode = true;
  }

  onSave() {
    try {
      if (this.permissionsJson && this.permissionsJson !== '') {
        this.policy.permission = JSON.parse(this.permissionsJson);
      }

      if (this.prohibitionsJson && this.prohibitionsJson !== '') {
        this.policy.prohibition = JSON.parse(this.prohibitionsJson);
      }

      if (this.obligationsJson && this.obligationsJson !== '') {
        this.policy.obligation = JSON.parse(this.obligationsJson);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.notificationService.showError("Error parsing JSON: " + error.message);
        console.error(error);
        return;
      }
    }

    this.policy["@context"] = "http://www.w3.org/ns/odrl.jsonld"


    this.dialogRef.close({
      policy: this.policyDefinition.policy,
      '@id': this.policyDefinition.id
    })
  }
}
