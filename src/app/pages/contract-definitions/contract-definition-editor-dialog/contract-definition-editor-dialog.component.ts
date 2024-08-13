import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssetService } from "../../../shared/services/asset.service";
import { PolicyService } from "../../../shared/services/policy.service";
import { Asset, PolicyDefinition, ContractDefinitionInput } from "../../../shared/models/edc-connector-entities";
import { NotificationService } from 'src/app/shared/services/notification.service';


@Component({
  selector: 'app-contract-definition-editor-dialog',
  templateUrl: './contract-definition-editor-dialog.component.html',
  styleUrls: ['./contract-definition-editor-dialog.component.scss']
})
export class ContractDefinitionEditorDialog implements OnInit {

  policies: Array<PolicyDefinition> = [];
  availableAssets: Asset[] = [];
  name: string = '';
  editMode = false;
  accessPolicy?: PolicyDefinition;
  contractPolicy?: PolicyDefinition;
  assets: Asset[] = [];
  contractDefinition: ContractDefinitionInput = {
    "@id": '',
    assetsSelector: [],
    accessPolicyId: undefined!,
    contractPolicyId: undefined!
  };

  constructor(private policyService: PolicyService,
    private assetService: AssetService,
    private dialogRef: MatDialogRef<ContractDefinitionEditorDialog>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) contractDefinition?: ContractDefinitionInput) {
    if (contractDefinition) {
      this.contractDefinition = contractDefinition;
      this.editMode = true;
    }

    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.policyService.queryAllPolicies().subscribe(policyDefinitions => {
      this.policies = policyDefinitions;
      this.accessPolicy = this.policies.find(policy => policy['@id'] === this.contractDefinition.accessPolicyId);
      this.contractPolicy = this.policies.find(policy => policy['@id'] === this.contractDefinition.contractPolicyId);
    });
    this.assetService.requestAssets().subscribe(assets => {
      this.availableAssets = assets;
      // preselection
      if (this.contractDefinition) {
        const assetIds = this.contractDefinition.assetsSelector.map(c => c.operandRight?.toString());
        this.assets = this.availableAssets.filter(asset => assetIds.includes(asset.id));
      }
    })
  }

  onSave() {
    if (!this.checkRequiredFields()) {
      this.notificationService.showError("Review required fields");
      return;
    }

    this.contractDefinition.accessPolicyId = this.accessPolicy['@id']!;
    this.contractDefinition.contractPolicyId = this.contractPolicy['@id']!;
    this.contractDefinition.assetsSelector = [];

    if (this.assets.length > 0) {
      const ids = this.assets.map(asset => asset.id);
      this.contractDefinition.assetsSelector = [...this.contractDefinition.assetsSelector, {
        operandLeft: 'https://w3id.org/edc/v0.0.1/ns/id',
        operator: 'in',
        operandRight: ids,
      }];
    }


    this.dialogRef.close({
      "contractDefinition": this.contractDefinition
    });
  }

  /**
   * Checks the required fields
   *
   * @returns true if required fields have been filled
   */
   private checkRequiredFields(): boolean {
    if (!this.contractDefinition['@id'] || !this.accessPolicy || !this.contractPolicy){
      return false;
    } else {
      return true;
    }
  }
}
