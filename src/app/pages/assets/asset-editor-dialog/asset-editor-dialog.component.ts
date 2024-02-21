import { Component, Inject, OnInit } from '@angular/core';
import { AssetInput, DataAddress } from "@think-it-labs/edc-connector-client";
import { MatDialogRef } from "@angular/material/dialog";
import { StorageType } from "../../../shared/models/storage-type";
import { NotificationService } from 'src/app/shared/services/notification.service';


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

  // AmazonS3 dataAddress attributes
  region: string = '';
  keyName: string = '';
  bucketName: string = '';

  // HttpData dataAddress attributes
  httpDataName: string = '';
  baseUrl: string = '';
  proxyPath: string = '';


  constructor(private dialogRef: MatDialogRef<AssetEditorDialog>,
              private notificationService: NotificationService,
      @Inject('STORAGE_TYPES') public storageTypes: StorageType[]) {
  }

  onSave() {
    if (!this.checkRequiredFields()) {
      this.notificationService.showError("Review required fields");
      return;
    }

    let dataAddress: any;

    if (this.storageTypeId === 'AmazonS3') {
      dataAddress = {
        "type": this.storageTypeId,
        "region": this.region,
        "keyName": this.keyName,
        "bucketName": this.bucketName
      };
    } else if (this.storageTypeId === 'HttpData') {
      dataAddress = {
        "type": this.storageTypeId,
        "name": this.httpDataName,
        "baseUrl": this.baseUrl,
        "proxyPath": this.proxyPath
      };
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

  private checkRequiredFields(): boolean {
    if(!this.id || !this.storageTypeId){
      return false;
    } else {
      return true;
    }
  }
}
