import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PolicyDefinitionCreatePageForm } from './policy-definition-create-page-form';
import { ExpressionFormHandler } from '../policy-editor/editor/expression-form-handler';
import { ValidationMessages } from 'src/app/shared/validators/validation-messages';
import { Subject } from 'rxjs';
import { PolicyDefinitionCreateDto } from '../policy-editor/model/policy-definition-create-dto';

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent  implements OnInit,OnDestroy {


  constructor(
    public form: PolicyDefinitionCreatePageForm,
    public expressionFormHandler: ExpressionFormHandler,
    public validationMessages: ValidationMessages,
    private dialogRef: MatDialogRef<NewPolicyDialogComponent>,
    private notificationService: NotificationService
  ) {

    dialogRef.disableClose = true;
  }

  ngOnInit(): void {

    this.expressionFormHandler.reset()
    this.form.reset()
  }

  onSave() {
    const createDto = this.buildPolicyDefinitionCreateDto();
    if(this.form.group.valid){
      this.dialogRef.close(createDto);
    }
  }

  buildPolicyDefinitionCreateDto(): PolicyDefinitionCreateDto {
    return {
      policyDefinitionId: this.form.group.controls.id.value,
      expression: this.expressionFormHandler.toUiPolicyExpression(),
    };
  }

  ngOnDestroy$ = new Subject();

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }
}
