import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { TransferProcessService } from "../../shared/services/transferProcess.service";
import { QuerySpec, TransferProcess } from "../../shared/models/edc-connector-entities";
import { ConfirmationDialogComponent, ConfirmDialogModel } from "../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['state', 'lastUpdated', 'assetId', 'contractId', 'action'];
  transferProcesses: TransferProcess[];
  storageExplorerLinkTemplate: string | undefined;

  // Pagination
  pageSize = 10;
  currentPage = 0;
  paginatorLength = 0;

  constructor(private transferProcessService: TransferProcessService,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.countTransferProcesses();
    this.loadTransferProcesses(this.currentPage);
    this.storageExplorerLinkTemplate = environment.runtime.storageExplorerLinkTemplate
  }

  onDeprovision(transferProcess: TransferProcess): void {

    const dialogData = new ConfirmDialogModel("Confirm deprovision", `Deprovisioning resources for transfer [${transferProcess["@id"]}] will take some time and once started, it cannot be stopped.`)
    dialogData.confirmColor = "warn";
    dialogData.confirmText = "Confirm";
    dialogData.cancelText = "Abort";
    const ref = this.dialog.open(ConfirmationDialogComponent, { maxWidth: '20%', data: dialogData });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.transferProcessService.deprovisionTransferProcess(transferProcess["@id"]!).subscribe(() => {
          this.countTransferProcesses();
          this.loadTransferProcesses(this.currentPage);
        });
      }
    });
  }

  showDeprovisionButton(transferProcess: TransferProcess) {
    return ['COMPLETED', 'PROVISIONED', 'REQUESTED', 'REQUESTED_ACK', 'IN_PROGRESS', 'STREAMING'].includes(transferProcess.state);
  }

  loadTransferProcesses(offset: number) {
    const querySpec: QuerySpec = {
      offset: offset,
      limit: this.pageSize
    }

    this.transferProcessService.queryAllTransferProcesses(querySpec)
      .subscribe(results => {
        this.transferProcesses = results;
      });
  }

  countTransferProcesses() {
    this.transferProcessService.count()
      .subscribe(result => {
        this.paginatorLength = result;
      });
  }

  asDate(epochMillis?: number) {
    return epochMillis ? new Date(epochMillis).toLocaleDateString() : '';
  }

  changePage(event: PageEvent) {
    const offset = event.pageIndex * event.pageSize;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadTransferProcesses(offset);
  }
}
