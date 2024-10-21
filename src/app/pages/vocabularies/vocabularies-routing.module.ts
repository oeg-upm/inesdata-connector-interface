
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VocabularyViewerComponent } from './vocabulary-viewer/vocabulary-viewer.component';

const routes: Routes = [
  { path: '', component: VocabularyViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VocabulariesRoutingModule { }
