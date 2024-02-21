
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogBrowserComponent } from './catalog-browser/catalog-browser.component';

const routes: Routes = [
  { path: '', component: CatalogBrowserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
