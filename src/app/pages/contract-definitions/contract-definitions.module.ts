import { NgModule } from '@angular/core';
import {ContractDefinitonsRoutingModule} from "./contract-definitions-routing.module"

import { ContractDefinitionViewerComponent } from './contract-definition-viewer/contract-definition-viewer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContractDefinitionNewComponent } from './contract-definition-new/contract-definition-new.component';

@NgModule({
  declarations: [
    ContractDefinitionViewerComponent,
    ContractDefinitionNewComponent
  ],
  imports: [
    ContractDefinitonsRoutingModule,
    SharedModule
  ]
})
export class ContractDefinitionsModule { }
