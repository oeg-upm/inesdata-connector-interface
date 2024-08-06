import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AssetInput, Asset } from "../../../shared/models/edc-connector-entities";
import { ConfirmationDialogComponent, ConfirmDialogModel } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { NotificationService } from "../../../shared/services/notification.service";
import { VocabularyEditorDialog } from '../vocabulary-editor-dialog/vocabulary-editor-dialog.component';
import { VocabularyService } from 'src/app/shared/services/vocabulary.service';
import { Vocabulary } from 'src/app/shared/models/vocabulary';
import { environment } from 'src/environments/environment';
import { VocabularySchemaViewerComponent } from '../vocabulary-schema-viewer/vocabulary-schema-viewer.component';

@Component({
  selector: 'app-vocabulary-viewer',
  templateUrl: './vocabulary-viewer.component.html',
  styleUrls: ['./vocabulary-viewer.component.scss']
})
export class VocabularyViewerComponent implements OnInit {

  vocabularies: Vocabulary[];

  isTransferring = false;
  private fetch$ = new BehaviorSubject(null);
  PARTICIPANT_ID = `${environment.runtime.participantId}`;

  constructor(private vocabularyService: VocabularyService,
    private notificationService: NotificationService,
    private readonly dialog: MatDialog) {
  }

  private showError(error: string, errorMessage: string) {
    this.notificationService.showError(errorMessage);
    console.error(error);
  }

  ngOnInit(): void {
    this.loadAssets();
  }

  isBusy() {
    return this.isTransferring;
  }

  onDelete(vocabulary: Vocabulary) {
    const dialogData = ConfirmDialogModel.forDelete("vocabulary", `"${vocabulary['@id']}"`)
    const ref = this.dialog.open(ConfirmationDialogComponent, { maxWidth: "30%", data: dialogData });

    ref.afterClosed().subscribe({
      next: res => {
        if (res) {
          this.vocabularyService.removeVocabulary(vocabulary['@id']).subscribe({
            next: () => this.fetch$.next(null),
            error: err => this.showError(err, "This vocabulary cannot be deleted"),
            complete: () => {
              this.loadAssets();
              this.notificationService.showInfo("Successfully deleted");
            }
          });
        }
      }
    });
  }

  onCreate() {
    const dialogRef = this.dialog.open(VocabularyEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { assetInput?: AssetInput }) => {
      const newAsset = result?.assetInput;
      // if (newAsset) {
      //   if (newAsset.dataAddress.type !== DATA_ADDRESS_TYPES.inesDataStore) {
      //     this.vocabularyService.createAsset(newAsset).subscribe({
      //       next: () => this.fetch$.next(null),
      //       error: err => this.showError(err, "This asset cannot be created"),
      //       complete: () => {
      //         this.loadAssets();
      //         this.notificationService.showInfo("Successfully created");
      //       }
      //     })
      //   } else {
      //     this.vocabularyService.createStorageAsset(newAsset).subscribe({
      //       next: () => this.fetch$.next(null),
      //       error: err => this.showError(err, "This asset cannot be created"),
      //       complete: () => {
      //         this.loadAssets();
      //         this.notificationService.showInfo("Successfully created");
      //       }
      //     })
      //   }

      // }
    })
  }

  loadAssets() {

    this.vocabularyService.requestSharedVocabularies()
      .subscribe(results => {
        this.vocabularies = results;
      });
  }

  viewSchema(title: string, schema: any) {
    const json = this.formatAndUnescapeJson(schema)
    this.dialog.open(VocabularySchemaViewerComponent, {
      data: {
        title: title,
        schema: json
      },
    });
  }

  formatAndUnescapeJson(escapedJson:string): string {
    let jsonObject: any;
    try {
      jsonObject = JSON.parse(escapedJson);
    } catch (error) {
      console.error("Error parsing JSON", error);
    }

    return JSON.stringify(jsonObject, null, 2);
  }
}
