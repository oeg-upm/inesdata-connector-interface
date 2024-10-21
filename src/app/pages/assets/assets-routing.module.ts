
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetViewerComponent } from './asset-viewer/asset-viewer.component';

const routes: Routes = [
  { path: '', component: AssetViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
