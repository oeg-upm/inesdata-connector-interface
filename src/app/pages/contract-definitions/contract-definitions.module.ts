import { NgModule } from '@angular/core';
import {ContractDefinitonsRoutingModule} from "./contract-definitions-routing.module"

import { ContractDefinitionViewerComponent } from './contract-definition-viewer/contract-definition-viewer.component';
import { ContractDefinitionEditorDialog } from './contract-definition-editor-dialog/contract-definition-editor-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ContractDefinitionViewerComponent,
    ContractDefinitionEditorDialog
  ],
  imports: [
    ContractDefinitonsRoutingModule,
    SharedModule
  ]
})
export class ContractDefinitionsModule { }
