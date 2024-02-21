
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PolicyViewComponent } from './policy-view/policy-view.component';

const routes: Routes = [
  { path: '', component: PolicyViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoliciesRoutingModule { }
