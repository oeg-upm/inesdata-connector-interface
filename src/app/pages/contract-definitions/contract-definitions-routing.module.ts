
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractDefinitionViewerComponent } from './contract-definition-viewer/contract-definition-viewer.component';

const routes: Routes = [
  { path: '', component: ContractDefinitionViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractDefinitonsRoutingModule { }
