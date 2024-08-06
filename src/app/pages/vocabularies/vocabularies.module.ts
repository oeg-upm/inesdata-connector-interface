import { NgModule } from '@angular/core';
import {VocabulariesRoutingModule} from "./vocabularies-routing.module"
import { VocabularyViewerComponent } from './vocabulary-viewer/vocabulary-viewer.component';
import { VocabularyEditorDialog } from './vocabulary-editor-dialog/vocabulary-editor-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { VocabularySchemaViewerComponent } from './vocabulary-schema-viewer/vocabulary-schema-viewer.component';


@NgModule({
  declarations: [
    VocabularyViewerComponent,
    VocabularyEditorDialog,
    VocabularySchemaViewerComponent
  ],
  imports: [
    VocabulariesRoutingModule,
    SharedModule
  ]
})
export class VocabulariesModule { }
