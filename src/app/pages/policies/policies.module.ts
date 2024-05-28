import { NgModule } from '@angular/core';
import {PoliciesRoutingModule} from "./policies-routing.module"

import { PolicyRuleViewerComponent } from './policy-rule-viewer/policy-rule-viewer.component';
import { PolicyViewComponent } from './policy-view/policy-view.component';
import { NewPolicyDialogComponent } from './new-policy-dialog/new-policy-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PolicyRuleViewerComponent,
    PolicyViewComponent,
    NewPolicyDialogComponent
  ],
  imports: [
    PoliciesRoutingModule,
    SharedModule
  ]
})
export class PoliciesModule { }
