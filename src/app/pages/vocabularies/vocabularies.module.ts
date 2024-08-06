import { NgModule } from '@angular/core';
import {VocabulariesRoutingModule} from "./vocabularies-routing.module"
import { VocabularyViewerComponent } from './vocabulary-viewer/vocabulary-viewer.component';
import { VocabularyEditorDialog } from './vocabulary-editor-dialog/vocabulary-editor-dialog.component';
import { SchemaFormModule } from "ngx-schema-form";

import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { SharedModule } from 'src/app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { VocabularySchemaViewerComponent } from './vocabulary-schema-viewer/vocabulary-schema-viewer.component';


@NgModule({
  declarations: [
    VocabularyViewerComponent,
    VocabularyEditorDialog,
    VocabularySchemaViewerComponent
  ],
  imports: [
    VocabulariesRoutingModule,
    SharedModule,
    SchemaFormModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    CKEditorModule

  ]
})
export class VocabulariesModule { }
