import { NgModule } from '@angular/core';
import {PoliciesRoutingModule} from "./policies-routing.module"

import { PolicyRuleViewerComponent } from './policy-rule-viewer/policy-rule-viewer.component';
import { PolicyViewComponent } from './policy-view/policy-view.component';
import { NewPolicyDialogComponent } from './new-policy-dialog/new-policy-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PolicyEditorModule } from './policy-editor/policy-editor.module';
import { PolicyDefinitionCreatePageForm } from './new-policy-dialog/policy-definition-create-page-form';
import { ExpressionFormControls } from './policy-editor/editor/expression-form-controls';
import { ExpressionFormHandler } from './policy-editor/editor/expression-form-handler';

@NgModule({
  declarations: [
    PolicyRuleViewerComponent,
    PolicyViewComponent,
    NewPolicyDialogComponent
  ],
  providers: [
    PolicyDefinitionCreatePageForm,
    ExpressionFormControls,
    ExpressionFormHandler
  ],
  imports: [
    PoliciesRoutingModule,
    SharedModule,
    PolicyEditorModule
  ]
})
export class PoliciesModule { }
