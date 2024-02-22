import { Component, Inject } from '@angular/core';
import { AssetInput, HttpDataAddress, DataAddress } from '@think-it-labs/edc-connector-client';
import { MatDialogRef } from "@angular/material/dialog";
import { StorageType } from "../../../shared/models/storage-type";
import { AmazonS3DataAddress } from "../../../shared/models/inesdata-data-address";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DATA_ADDRESS_TYPES } from 'src/app/shared/utils/app.constants';


@Component({
  selector: 'app-asset-editor-dialog',
  templateUrl: './asset-editor-dialog.component.html',
  styleUrls: ['./asset-editor-dialog.component.scss']
})
export class AssetEditorDialog {

  id: string = '';
  version: string = '';
  name: string = '';
  contenttype: string = '';
  storageTypeId: string = '';

  amazonS3DataAddress: AmazonS3DataAddress = {
    type: 'AmazonS3',
    region: ''
  };

  httpDataAddress: HttpDataAddress = {
    type: 'HttpData'
  };


  constructor(private dialogRef: MatDialogRef<AssetEditorDialog>,
              private notificationService: NotificationService,
      @Inject('STORAGE_TYPES') public storageTypes: StorageType[]) {
  }

  onSave() {
    if (!this.checkRequiredFields()) {
      this.notificationService.showError("Review required fields");
      return;
    }

    let dataAddress: DataAddress;

    if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3) {
      dataAddress = this.amazonS3DataAddress;
    } else if (this.storageTypeId === DATA_ADDRESS_TYPES.httpData) {
      dataAddress = this.httpDataAddress;
    } else {
      this.notificationService.showError("Incorrect destination value");
      return;
    }

    const assetInput: AssetInput = {
      "@id": this.id,
      properties: {
        "name": this.name,
        "version": this.version,
        "contenttype": this.contenttype,
      },
      dataAddress: dataAddress
    };

    this.dialogRef.close({ assetInput });
  }

  /**
   * Checks the required fields
   *
   * @returns true if required fields have been filled
   */
  private checkRequiredFields(): boolean {
    if (!this.id || !this.storageTypeId){
      return false;
    } else {
      if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3 && !this.amazonS3DataAddress.region) {
        return false;
      } else {
        return true;
      }
    }
  }
}
