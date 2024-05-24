import { environment } from 'src/environments/environment';
import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {TransferProcessService} from "../../shared/services/transferProcess.service";
import {TransferProcess} from "../../shared/models/edc-connector-entities";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../shared/components/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['state', 'lastUpdated', 'assetId', 'contractId', 'action'];
  transferProcesses$: Observable<TransferProcess[]> = of([]);
  storageExplorerLinkTemplate: string | undefined;

  constructor(private transferProcessService: TransferProcessService,
              private dialog : MatDialog) {
  }

  ngOnInit(): void {
    this.loadTransferProcesses();
    this.storageExplorerLinkTemplate = environment.runtime.storageExplorerLinkTemplate
  }

  onDeprovision(transferProcess: TransferProcess): void {

    const dialogData = new ConfirmDialogModel("Confirm deprovision", `Deprovisioning resources for transfer [${transferProcess["@id"]}] will take some time and once started, it cannot be stopped.`)
    dialogData.confirmColor = "warn";
    dialogData.confirmText = "Confirm";
    dialogData.cancelText = "Abort";
    const ref = this.dialog.open(ConfirmationDialogComponent, {maxWidth: '20%', data: dialogData});

    ref.afterClosed().subscribe(res => {
      if (res) {
       this.transferProcessService.deprovisionTransferProcess(transferProcess["@id"]!).subscribe(() => this.loadTransferProcesses());
      }
    });
  }

  showDeprovisionButton(transferProcess: TransferProcess) {
    return ['COMPLETED', 'PROVISIONED', 'REQUESTED', 'REQUESTED_ACK', 'IN_PROGRESS', 'STREAMING'].includes(transferProcess.state);
  }

  loadTransferProcesses() {
     this.transferProcesses$ = this.transferProcessService.queryAllTransferProcesses();
  }

  asDate(epochMillis?: number) {
    return epochMillis ? new Date(epochMillis).toLocaleDateString() : '';
  }
}
