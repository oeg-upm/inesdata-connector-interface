import { NgModule } from '@angular/core';
import { CatalogRoutingModule } from './catalog-routing.module'

import { CatalogBrowserComponent } from './catalog-browser/catalog-browser.component';
import { ContractOffersViewerComponent } from './contract-offers-viewer/contract-offers-viewer.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    CatalogBrowserComponent,
    ContractOffersViewerComponent
  ],
  imports: [
    CatalogRoutingModule,
    SharedModule
  ]
})
export class CatalogModule { }
