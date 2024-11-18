import { Component, OnInit } from '@angular/core';
import { AssetService } from "../../../shared/services/asset.service";
import { PolicyService } from "../../../shared/services/policy.service";
import { Asset, PolicyDefinition, ContractDefinitionInput } from "../../../shared/models/edc-connector-entities";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ContractDefinitionService } from 'src/app/shared/services/contractDefinition.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-contract-definition-new',
  templateUrl: './contract-definition-new.component.html',
  styleUrls: ['./contract-definition-new.component.scss']
})
export class ContractDefinitionNewComponent implements OnInit {

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
  private fetch$ = new BehaviorSubject(null);

  constructor(private policyService: PolicyService,
    private assetService: AssetService,
    private notificationService: NotificationService,
    private contractDefinitionService: ContractDefinitionService,
    private router: Router) {
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


    const newContractDefinition = this.contractDefinition;
    if (newContractDefinition) {
      this.contractDefinitionService.createContractDefinition(newContractDefinition)
        .subscribe({
          next: () => this.fetch$.next(null),
          error: () => this.notificationService.showError("Contract definition cannot be created"),
          complete: () => {
            this.navigateToContractDefinitions()
            this.notificationService.showInfo("Contract definition created")
          }
        });
    }
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

  navigateToContractDefinitions(){
    this.router.navigate(['contract-definitions'])
  }
}
