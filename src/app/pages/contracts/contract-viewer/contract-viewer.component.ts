import {Component, OnInit} from '@angular/core';
import {ContractAgreementService} from "../../../shared/services/contractAgreement.service";
import {from, Observable, of} from "rxjs";
import { ContractAgreement, IdResponse } from "../../../shared/models/edc-connector-entities";
import {filter, map, switchMap, tap} from "rxjs/operators";
import {NotificationService} from"../../../shared/services/notification.service";
import {MatDialog} from "@angular/material/dialog";
import {CatalogBrowserService} from "../../../shared/services/catalog-browser.service";
import {Router} from "@angular/router";
import {TransferProcessStates} from "../../../shared/models/transfer-process-states";
import { DataOffer } from 'src/app/shared/models/data-offer';

interface RunningTransferProcess {
  processId: string;
  contractId: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'app-contract-viewer',
  templateUrl: './contract-viewer.component.html',
  styleUrls: ['./contract-viewer.component.scss']
})
export class ContractViewerComponent implements OnInit {

  contracts$: Observable<ContractAgreement[]> = of([]);
  private runningTransfers: RunningTransferProcess[] = [];
  private pollingHandleTransfer?: any;

  constructor(private contractAgreementService: ContractAgreementService,
              public dialog: MatDialog,
              private catalogService: CatalogBrowserService,
              private router: Router,
              private notificationService: NotificationService) {
  }

  private static isFinishedState(state: string): boolean {
    return [
      "COMPLETED",
      "ERROR",
      "ENDED"].includes(state);
  }

  ngOnInit(): void {
    this.contracts$ = this.contractAgreementService.queryAllAgreements();
  }

  asDate(epochSeconds?: number): string {
    if(epochSeconds){
      const d = new Date(0);
      d.setUTCSeconds(epochSeconds);
      return d.toLocaleDateString();
    }
    return '';
  }

  isTransferInProgress(contractId: string): boolean {
    return !!this.runningTransfers.find(rt => rt.contractId === contractId);
  }

  /**
   * This method is used to obtain that URL of the connector that is offering a particular asset from the catalog.
   * This is a bit of a hack, because currently there is no "clean" way to get the counter-party's URL for a ContractAgreement.
   *
   * @param assetId Asset ID of the asset that is associated with the contract.
   */
  private getContractOfferForAssetId(assetId: string): Observable<DataOffer> {
    return this.catalogService.getDataOffers()
      .pipe(
        map(offers => offers.find(o => o.assetId === assetId)),
        map(o => {
          if (o) return o;
          else throw new Error(`No offer found for asset ID ${assetId}`);
        }))
  }

  private startPolling(transferProcessId: IdResponse, contractId: string) {
    // track this transfer process
    this.runningTransfers.push({
      processId: transferProcessId.id,
      state: TransferProcessStates.REQUESTED,
      contractId: contractId
    });

    if (!this.pollingHandleTransfer) {
      this.pollingHandleTransfer = setInterval(this.pollRunningTransfers(), 1000);
    }

  }

  private pollRunningTransfers() {
    return () => {
      from(this.runningTransfers) //create from array
        .pipe(switchMap(runningTransferProcess => this.catalogService.getTransferProcessesById(runningTransferProcess.processId)), // fetch from API
          filter(transferprocess => ContractViewerComponent.isFinishedState(transferprocess.state!)), // only use finished ones
          tap(transferProcess => {
            // remove from in-progress
            this.runningTransfers = this.runningTransfers.filter(rtp => rtp.processId !== transferProcess.id)
            this.notificationService.showInfo(`Transfer [${transferProcess.id}] complete!`, "Show me!", () => {
              this.router.navigate(['/transfer-history'])
            })
          }),
        ).subscribe(() => {
        // clear interval if necessary
        if (this.runningTransfers.length === 0) {
          clearInterval(this.pollingHandleTransfer);
          this.pollingHandleTransfer = undefined;
        }
      }, error => this.notificationService.showError(error))
    }

  }
}