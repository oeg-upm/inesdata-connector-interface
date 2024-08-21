import { Component, OnInit } from '@angular/core';
import { ContractAgreementService } from "../../../shared/services/contractAgreement.service";
import { firstValueFrom, from } from "rxjs";
import { ContractAgreement, IdResponse, TransferProcessInput } from "../../../shared/models/edc-connector-entities";
import { filter, first, switchMap, tap } from "rxjs/operators";
import { NotificationService } from "../../../shared/services/notification.service";
import { MatDialog } from "@angular/material/dialog";
import { CatalogBrowserService } from "../../../shared/services/catalog-browser.service";
import { Router } from "@angular/router";
import { TransferProcessStates } from "../../../shared/models/transfer-process-states";
import { DataOffer } from 'src/app/shared/models/data-offer';
import { ContractTransferDialog } from '../contract-transfer-dialog/contract-transfer-dialog.component';
import { TransferProcessService } from 'src/app/shared/services/transferProcess.service';
import { DataAddress, QuerySpec } from '@think-it-labs/edc-connector-client';
import { PageEvent } from '@angular/material/paginator';
import { DATA_ADDRESS_TYPES } from 'src/app/shared/utils/app.constants';

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

  contracts: ContractAgreement[];
  private runningTransfers: RunningTransferProcess[] = [];
  private pollingHandleTransfer?: any;

  // Pagination
  pageSize = 10;
  currentPage = 0;
  paginatorLength = 0;

  constructor(private contractAgreementService: ContractAgreementService,
    public dialog: MatDialog,
    private catalogService: CatalogBrowserService,
    private transferService: TransferProcessService,
    private router: Router,
    private notificationService: NotificationService) {
  }

  private static isFinishedState(storageType: string, state: string): boolean {
    if (storageType === 'HttpData-PULL' && state === 'STARTED') {
      return true;
    } else {
      return [
        "COMPLETED",
        "ERROR",
        "ENDED","TERMINATED"].includes(state);
    }
  }

  ngOnInit(): void {
    this.countContractAgreements()
    this.loadContractAgreements(this.currentPage);
  }

  onTransferClicked(contract: ContractAgreement) {
    const dialogRef = this.dialog.open(ContractTransferDialog, { disableClose: true });

    dialogRef.afterClosed().pipe(first()).subscribe(async result => {
      if (result !== undefined && result.transferButtonclicked) {

        const transferRequest = await this.createTransferRequest(contract, result.dataAddress);

        if(result.dataAddress.type === DATA_ADDRESS_TYPES.inesDataStore){
          this.transferService.initiateInesdataTransfer(transferRequest)
          .subscribe(transferId => {
            this.startPolling(transferId, contract["@id"]!);
          }, error => {
            console.error(error);
            this.notificationService.showError("Error initiating transfer");
          });
        }else{
          this.transferService.initiateTransfer(transferRequest)
          .subscribe(transferId => {
            this.startPolling(transferId, contract["@id"]!);
          }, error => {
            console.error(error);
            this.notificationService.showError("Error initiating transfer");
          });
        }
      }
    });
  }

  asDate(epochSeconds?: number): string {
    if (epochSeconds) {
      const d = new Date(0);
      d.setUTCSeconds(epochSeconds);
      return d.toLocaleDateString();
    }
    return '';
  }

  isTransferInProgress(contractId: string): boolean {
    return !!this.runningTransfers.find(rt => rt.contractId === contractId);
  }

  changePage(event: PageEvent) {
    const offset = event.pageIndex * event.pageSize;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadContractAgreements(offset);
  }

  private loadContractAgreements(offset: number) {
    const querySpec: QuerySpec = {
      offset: offset,
      limit: this.pageSize
    }

    this.contractAgreementService.queryAllAgreements(querySpec)
      .subscribe(results => {
        this.contracts = results;
      });
  }

  private countContractAgreements() {
    this.contractAgreementService.count()
      .subscribe(result => {
        this.paginatorLength = result;
      });
  }

  private async createTransferRequest(contract: ContractAgreement, dataAddress: DataAddress): Promise<TransferProcessInput> {
    const dataOffer = await this.getDatasetFromFederatedCatalog(contract.assetId, contract.providerId);

    const transferType = this.getTransferType(dataAddress.type);

    const iniateTransfer: TransferProcessInput = {
      assetId: dataOffer.assetId,
      counterPartyAddress: dataOffer.endpointUrl,
      contractId: contract.id,
      transferType: transferType,
      dataDestination: dataAddress
    };

    return iniateTransfer;
  }

  private getTransferType(type: string) {
    if(type === 'HttpData') {
      return 'HttpData-PULL'
    } else {
      return 'AmazonS3-PUSH'
    }
  }

  /**
   * This method is used to obtain that URL of the connector that is offering a particular asset from the catalog.
   *
   * @param assetId Asset ID of the asset that is associated with the contract.
   * @param provider Participant ID of the catalog which owns the asset
   */
   private async getDatasetFromFederatedCatalog(assetId: string, provider: string): Promise<DataOffer> {

    const querySpec: QuerySpec = {
      offset: 0,
      limit: 1,
      filterExpression: [
        {
          operandLeft: "id",
          operator: "=",
          operandRight: assetId
        },
        {
          operandLeft: "properties.'https://w3id.org/edc/v0.0.1/ns/participantId'",
          operator: "=",
          operandRight: provider
        }
      ]
    }

    const datasetFound = await firstValueFrom(this.catalogService.getPaginatedDataOffers(querySpec));

    if (datasetFound[0]) {
      return datasetFound[0];
    } else {
      throw new Error(`No offer found for asset ID ${assetId} and provider ID ${provider}`);
    }
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
          filter(transferprocess => ContractViewerComponent.isFinishedState(transferprocess['https://w3id.org/edc/v0.0.1/ns/transferType'][0]['@value'], transferprocess.state)), // only use finished ones
          tap(transferProcess => {
            // remove from in-progress
            this.runningTransfers = this.runningTransfers.filter(rtp => rtp.processId !== transferProcess.id)
            this.notificationService.showWarning(`Transfer [${transferProcess.id}] complete! Check if the process was successful`, "Show me!", () => {
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
