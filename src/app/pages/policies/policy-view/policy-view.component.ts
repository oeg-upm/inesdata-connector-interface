import { Component, OnInit } from '@angular/core';
import { PolicyService } from "../../../shared/services/policy.service";
import { BehaviorSubject, Observer } from "rxjs";
import { first } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { NewPolicyDialogComponent } from "../new-policy-dialog/new-policy-dialog.component";
import { NotificationService } from "../../../shared/services/notification.service";
import { ConfirmationDialogComponent, ConfirmDialogModel } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { PolicyDefinition, PolicyDefinitionInput, IdResponse, QuerySpec } from "../../../shared/models/edc-connector-entities";
import { PolicyRuleViewerComponent } from '../policy-rule-viewer/policy-rule-viewer.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.scss']
})
export class PolicyViewComponent implements OnInit {

  policies: PolicyDefinition[];
  private fetch$ = new BehaviorSubject(null);
  private readonly errorOrUpdateSubscriber: Observer<IdResponse>;

  // Pagination
  pageSize = 10;
  currentPage = 0;
  hasMoreData = true;
  paginatorLength = 0;

  constructor(private policyService: PolicyService,
    private notificationService: NotificationService,
    private readonly dialog: MatDialog) {

    this.errorOrUpdateSubscriber = {
      next: x => this.fetch$.next(null),
      error: err => this.showError(err, "An error occurred."),
      complete: () => {
        this.notificationService.showInfo("Successfully completed")
      },
    }

  }

  ngOnInit(): void {
    this.countPolicies();
    this.loadPolicies(this.currentPage);
  }

  onCreate() {
    const dialogRef = this.dialog.open(NewPolicyDialogComponent);
    dialogRef.afterClosed().pipe(first()).subscribe({
      next: (newPolicyDefinition: PolicyDefinitionInput) => {
        if (newPolicyDefinition) {
          this.policyService.createPolicy(newPolicyDefinition).subscribe(
            {
              next: (response: IdResponse) => this.errorOrUpdateSubscriber.next(response),
              error: (error: Error) => this.showError(error, "An error occurred while creating the policy."),
              complete: () => {
                this.countPolicies();
                this.loadPolicies(this.currentPage);
                this.notificationService.showInfo("Successfully created");
              }
            }
          );
        }
      }
    });
  }

  delete(policy: PolicyDefinition) {

    let policyId = policy['@id']!;
    const dialogData = ConfirmDialogModel.forDelete("policy", policyId);

    const ref = this.dialog.open(ConfirmationDialogComponent, { maxWidth: '30%', data: dialogData });

    ref.afterClosed().subscribe({

      next: (res: any) => {
        if (res) {
          this.policyService.deletePolicy(policyId).subscribe(
            {
              next: (response: IdResponse) => this.errorOrUpdateSubscriber.next(response),
              error: (error: Error) => this.showError(error, "An error occurred while deleting the policy."),
              complete: () => {
                this.countPolicies();
                this.loadPolicies(this.currentPage);
                this.notificationService.showInfo("Successfully deleted");
              }
            }
          );
        }
      }
    });
  }

  private showError(error: Error, errorMessage: string) {
    console.error(error);
    this.notificationService.showError(errorMessage);
  }

  viewRules(title: string, rules: any) {
    this.dialog.open(PolicyRuleViewerComponent, {
      data: {
        title: title,
        rules: rules
      },
    });
  }

  changePage(event: PageEvent) {
    const offset = event.pageIndex * event.pageSize;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadPolicies(offset);
  }

  loadPolicies(offset: number) {

    const querySpec: QuerySpec = {
      offset: offset,
      limit: this.pageSize
    }

    this.policyService.queryAllPolicies(querySpec)
      .subscribe(results => {
        this.policies = results;
      });
  }

  countPolicies() {
    this.policyService.count()
      .subscribe(result => {
        this.paginatorLength = result;
      });
  }
}
