import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  schema: any;
}

@Component({
  selector: 'vocabulary-schemas',
  templateUrl: './vocabulary-schema-viewer.component.html'
})
export class VocabularySchemaViewerComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
