import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransferProcessStates } from "../../../shared/models/transfer-process-states";
import { NegotiationResult } from "../../../shared/models/negotiation-result";
import { ContractNegotiation, ContractNegotiationRequest, Policy } from "../../../shared/models/edc-connector-entities";
import { CatalogBrowserService } from 'src/app/shared/services/catalog-browser.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageType } from 'src/app/shared/models/storage-type';

export interface ContractOffersDialogData {
  assetId: string;
  contractOffers?: Policy[];
  endpointUrl?: string;
  properties: any;
  privateProperties: any;
  dataAddress?: any;
  isCatalogView: boolean;
}

interface RunningTransferProcess {
  processId: string;
  assetId?: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'contract-offers-viewer',
  templateUrl: './contract-offers-viewer.component.html',
  styleUrls: ['./contract-offers-viewer.component.scss']
})
export class ContractOffersViewerComponent {

  runningTransferProcesses: RunningTransferProcess[] = [];
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>();
  finishedNegotiations: Map<string, ContractNegotiation> = new Map<string, ContractNegotiation>();
  assetDataKeys: string[];
  assetDataEntries: { [key: string]: any[] } = {};
  dataAddressType: string;

  private pollingHandleNegotiation?: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ContractOffersDialogData,
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[],
    private apiService: CatalogBrowserService, private notificationService: NotificationService) {
    this.assetDataKeys = Object.keys(data.properties.assetData);
    this.processAssetData();

    if(data.dataAddress) {
      if(data.privateProperties) {
        this.dataAddressType = 'InesDataStore';
      } else {
        this.dataAddressType = this.getDataAddressName(data.dataAddress.type);
        delete data.dataAddress['@type'];
      }

    }
  }

  getDataAddressName(dataAddressTypeId: string) {
    const foundObject = this.storageTypes.find(item => item.id === dataAddressTypeId);
    return foundObject ? foundObject.name : null;
}

  processAssetData() {
    this.assetDataKeys = this.assetDataKeys.filter(key => {
      const entries = this.getEntries(this.data.properties.assetData[key]);

      if (entries.length === 0) {
        return false;
      }

      this.assetDataEntries[key] = entries.map(item => ({
        key: item.key,
        value: item.value,
        isObject: this.isObject(item.value),
        isArray: this.isArray(item.value),
        entries: this.isObject(item.value) ? this.getEntries(item.value) : null
      }));

      return true;
    });
  }

  hasDetailedInformation() {
    return this.data && this.data.properties && this.data.properties.assetData &&
      Object.keys(this.data.properties.assetData).length > 0;
  }

  getEntries(obj: any): { key: string, value: any }[] {
    return Object.entries(obj || {}).map(([key, value]) => ({ key, value }));
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  containsOnlyObjects(array: any[]): boolean {
    return array.every(item => this.isObject(item));
  }

  isBusy(contractOffer: Policy) {
    return this.runningNegotiations.get(contractOffer["@id"]) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
  }

  getState(contractOffer: Policy): string {
    const transferProcess = this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
    if (transferProcess) {
      return TransferProcessStates[transferProcess.state];
    }

    const negotiation = this.runningNegotiations.get(contractOffer["@id"]);
    if (negotiation) {
      return 'negotiating';
    }

    return '';
  }

  isNegotiated(contractOffer: Policy) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }

  onNegotiateClicked(contractOffer: Policy) {
    const initiateRequest: ContractNegotiationRequest = {
      counterPartyAddress: this.data.endpointUrl,
      policy: contractOffer
    };

    this.apiService.initiateNegotiation(initiateRequest).subscribe(negotiationId => {
      this.finishedNegotiations.delete(initiateRequest.policy["@id"]);
      this.runningNegotiations.set(initiateRequest.policy["@id"], {
        id: negotiationId,
        offerId: initiateRequest.policy["@id"]
      });


      if (!this.pollingHandleNegotiation) {
        this.checkActiveNegotiations();
      }
    }, error => {
      console.error(error);
      this.notificationService.showError("Error starting negotiation");
    });
  }

  checkActiveNegotiations() {
    // there are no active negotiations
    this.pollingHandleNegotiation = setInterval(() => {

      const finishedNegotiationStates = [
        "VERIFIED",
        "TERMINATED",
        "FINALIZED",
        "ERROR"];

      for (const negotiation of this.runningNegotiations.values()) {
        this.apiService.getNegotiationState(negotiation.id).subscribe(updatedNegotiation => {
          if (finishedNegotiationStates.includes(updatedNegotiation.state)) {
            let offerId = negotiation.offerId;
            this.runningNegotiations.delete(offerId);
            if (updatedNegotiation["state"] === "VERIFIED" || updatedNegotiation["state"] === "FINALIZED") {
              this.finishedNegotiations.set(offerId, updatedNegotiation);
              this.notificationService.showInfo("Contract Negotiation complete!");
            }
          }

          if (this.runningNegotiations.size === 0) {
            clearInterval(this.pollingHandleNegotiation);
            this.pollingHandleNegotiation = undefined;
          }
        });
      }
    }, 1000);
  }

  getJsonPolicy(policy: Policy): any {
    return {
      permission: policy['odrl:permission'],
      prohibition: policy['odrl:prohibition'],
      obligation: policy['odrl:obligation']
    }
  }
}
