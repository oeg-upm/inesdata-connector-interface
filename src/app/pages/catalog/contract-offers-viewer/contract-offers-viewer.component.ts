import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractOffer } from '../../../shared/models/contract-offer';
import { TransferProcessStates } from "../../../shared/models/transfer-process-states";
import { NegotiationResult } from "../../../shared/models/negotiation-result";
import { ContractNegotiation, ContractNegotiationRequest, PolicyInput } from "../../../shared/models/edc-connector-entities";
import { CatalogBrowserService } from 'src/app/shared/services/catalog-browser.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Router } from '@angular/router';

export interface ContractOffersDialogData {
  assetId: string;
  contractOffers: ContractOffer[];
  originator: string;
  properties: any;
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
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>(); // contractOfferId, NegotiationResult
  finishedNegotiations: Map<string, ContractNegotiation> = new Map<string, ContractNegotiation>(); // contractOfferId, contractAgreementId

  private pollingHandleNegotiation?: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ContractOffersDialogData,
    private apiService: CatalogBrowserService, private notificationService: NotificationService,
    private router: Router) { }

  isBusy(contractOffer: ContractOffer) {
    return this.runningNegotiations.get(contractOffer.id) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
  }

  getState(contractOffer: ContractOffer): string {
    const transferProcess = this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
    if (transferProcess) {
      return TransferProcessStates[transferProcess.state];
    }

    const negotiation = this.runningNegotiations.get(contractOffer.id);
    if (negotiation) {
      return 'negotiating';
    }

    return '';
  }

  isNegotiated(contractOffer: ContractOffer) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }

  onNegotiateClicked(contractOffer: ContractOffer) {
    const initiateRequest: ContractNegotiationRequest = {
      counterPartyAddress: this.data.originator,
      policy: contractOffer.policy,
      providerId: contractOffer.policy.target!
    };

    const finishedNegotiationStates = [
      "VERIFIED",
      "TERMINATED",
      "ERROR"];

    this.apiService.initiateNegotiation(initiateRequest).subscribe(negotiationId => {
      this.finishedNegotiations.delete(initiateRequest.policy.uid);
      this.runningNegotiations.set(initiateRequest.policy.uid, {
        id: negotiationId,
        offerId: initiateRequest.policy.uid
      });

      if (!this.pollingHandleNegotiation) {
        // there are no active negotiations
        this.pollingHandleNegotiation = setInterval(() => {
          // const finishedNegotiations: NegotiationResult[] = [];

          for (const negotiation of this.runningNegotiations.values()) {
            this.apiService.getNegotiationState(negotiation.id).subscribe(updatedNegotiation => {
              if (finishedNegotiationStates.includes(updatedNegotiation.state!)) {
                let offerId = negotiation.offerId;
                this.runningNegotiations.delete(offerId);
                if (updatedNegotiation["state"] === "VERIFIED") {
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
    }, error => {
      console.error(error);
      this.notificationService.showError("Error starting negotiation");
    });
  }

  getPolicy(policy: PolicyInput): any {
    return {
      permission: policy.permission,
      obligation: policy.obligation,
      prohibition: policy.prohibition
    }
  }
}
