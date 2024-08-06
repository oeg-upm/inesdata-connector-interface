import { Component} from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { Vocabulary } from "../../../shared/models/vocabulary";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CATEGORIES } from 'src/app/shared/utils/app.constants';


@Component({
  selector: 'app-vocabulary-editor-dialog',
  templateUrl: './vocabulary-editor-dialog.component.html',
  styleUrls: ['./vocabulary-editor-dialog.component.scss']
})
export class VocabularyEditorDialog {

  // Default asset properties
  id: string = '';
  name: string = '';
  category: string = '';
  jsonSchema: string = '';
  categories = Object.entries(CATEGORIES);


  constructor(private dialogRef: MatDialogRef<VocabularyEditorDialog>,
    private notificationService: NotificationService) {
  }

  async onSave() {
    // Check whether the asset is valid
    if (!this.checkRequiredFields()) {
      this.notificationService.showError("Review the form fields");
      return;
    }

    // Create EDC asset
    const vocabulary: Vocabulary = {
      "@id": this.id,
      name: this.name,
      category: this.category,
      jsonSchema: this.jsonSchema
    };


    this.dialogRef.close({ vocabulary });
  }

  /**
   * Checks the required fields
   *
   * @returns true if required fields have been filled
   */
  private checkRequiredFields(): boolean {
    if (!this.id || !this.name || !this.jsonSchema || !this.category) {
      return false;
    }else{
      return true;
    }
  }
}
