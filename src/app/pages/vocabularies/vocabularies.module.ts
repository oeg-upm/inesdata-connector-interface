import { NgModule } from '@angular/core';
import {VocabulariesRoutingModule} from "./vocabularies-routing.module"
import { VocabularyViewerComponent } from './vocabulary-viewer/vocabulary-viewer.component';
import { VocabularyEditorDialog } from './vocabulary-editor-dialog/vocabulary-editor-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    VocabularyViewerComponent,
    VocabularyEditorDialog
  ],
  imports: [
    VocabulariesRoutingModule,
    SharedModule
  ]
})
export class VocabulariesModule { }
