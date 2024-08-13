import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import {
  ContractDefinitionEditorDialog
} from '../contract-definition-editor-dialog/contract-definition-editor-dialog.component';
import { ContractDefinitionService } from "../../../shared/services/contractDefinition.service";
import { ConfirmationDialogComponent, ConfirmDialogModel } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { NotificationService } from "../../../shared/services/notification.service";
import { ContractDefinition, ContractDefinitionInput } from 'src/app/shared/models/edc-connector-entities';
import { PageEvent } from '@angular/material/paginator';
import { QuerySpec } from '@think-it-labs/edc-connector-client';


@Component({
  selector: 'app-contract-definition-viewer',
  templateUrl: './contract-definition-viewer.component.html',
  styleUrls: ['./contract-definition-viewer.component.scss']
})
export class ContractDefinitionViewerComponent implements OnInit {

  contractDefinitions: ContractDefinition[];
  private fetch$ = new BehaviorSubject(null);

  // Pagination
  pageSize = 10;
  currentPage = 0;
  paginatorLength = 0;

  constructor(private contractDefinitionService: ContractDefinitionService,
    private notificationService: NotificationService,
    private readonly dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.countContractDefinitions();
    this.loadContractDefinitions(this.currentPage);
  }

  onDelete(contractDefinition: ContractDefinition) {
    const dialogData = ConfirmDialogModel.forDelete("contract definition", contractDefinition.id);

    const ref = this.dialog.open(ConfirmationDialogComponent, { maxWidth: '30%', data: dialogData });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.contractDefinitionService.deleteContractDefinition(contractDefinition.id)
          .subscribe({
            next: () => this.fetch$.next(null),
            error: () => this.notificationService.showError("Contract definition cannot be deleted"),
            complete: () => {
              this.countContractDefinitions();
              this.loadContractDefinitions(this.currentPage);
              this.notificationService.showInfo("Contract definition deleted")
            }
          });
      }
    });

  }

  onCreate() {
    const dialogRef = this.dialog.open(ContractDefinitionEditorDialog, { disableClose: true });
    dialogRef.afterClosed().pipe(first()).subscribe((result: { contractDefinition?: ContractDefinitionInput }) => {
      const newContractDefinition = result?.contractDefinition;
      if (newContractDefinition) {
        this.contractDefinitionService.createContractDefinition(newContractDefinition)
          .subscribe({
            next: () => this.fetch$.next(null),
            error: () => this.notificationService.showError("Contract definition cannot be created"),
            complete: () => {
              this.countContractDefinitions();
              this.loadContractDefinitions(this.currentPage);
              this.notificationService.showInfo("Contract definition created")
            }
          });
      }
    });
  }

  changePage(event: PageEvent) {
    const offset = event.pageIndex * event.pageSize;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadContractDefinitions(offset);
  }

  loadContractDefinitions(offset: number) {

    const querySpec: QuerySpec = {
      offset: offset,
      limit: this.pageSize
    }

    this.contractDefinitionService.queryAllContractDefinitions(querySpec)
      .subscribe(results => {
        this.contractDefinitions = results;
      });
  }

  countContractDefinitions() {
    this.contractDefinitionService.count()
      .subscribe(result => {
        this.paginatorLength = result;
      });
  }

  getCriterionFormat(criterion:any){
    return criterion['https://w3id.org/edc/v0.0.1/ns/operandRight'].map((c:any)=> c['@value']).join(', ')
  }
}
