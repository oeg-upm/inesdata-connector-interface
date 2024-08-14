import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataAddress, HttpDataAddress } from '@think-it-labs/edc-connector-client';
import { AmazonS3DataAddress } from 'src/app/shared/models/amazon-s3-data-address';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DATA_ADDRESS_TYPES } from 'src/app/shared/utils/app.constants';
import { StorageType } from '../../../shared/models/storage-type';


@Component({
  selector: 'app-contract-transfer-dialog',
  templateUrl: './contract-transfer-dialog.component.html',
  styleUrls: ['./contract-transfer-dialog.component.scss']
})
export class ContractTransferDialog {

  name: string = '';
  storageTypeId = '';

   // Storage information
   amazonS3DataAddress: AmazonS3DataAddress = {
    type: 'AmazonS3',
    region: ''
  };

  httpDataAddress: HttpDataAddress = {
    type: 'HttpData'
  };

  constructor(@Inject('TRANSFER_TYPES') public transferTypes: StorageType[],
    private dialogRef: MatDialogRef<ContractTransferDialog>,
    private notificationService: NotificationService) {

      dialogRef.disableClose = true;
  }

  onTransfer() {
    let dataAddress: DataAddress;

    if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3) {
      dataAddress = this.amazonS3DataAddress;
      // Check whether the asset is valid
      if (!this.checkRequiredFields()) {
        this.notificationService.showError("Review the form fields");
        return;
      }
    } else if (this.storageTypeId === DATA_ADDRESS_TYPES.httpData) {
      dataAddress = this.httpDataAddress;
    } else {
      this.notificationService.showError("Incorrect destination value");
      return;
    }

    this.dialogRef.close({
      dataAddress: dataAddress,
      transferButtonclicked: true
    });
  }

    /**
   * Checks the required fields
   *
   * @returns true if required fields have been filled
   */
  private checkRequiredFields(): boolean {
    if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3 && (!this.amazonS3DataAddress.region || !this.amazonS3DataAddress.bucketName
        || !this.amazonS3DataAddress.endpointOverride || !this.amazonS3DataAddress.secretAccessKey || !this.amazonS3DataAddress.accessKeyId)) {
      return false;
    }
    else if (this.storageTypeId === DATA_ADDRESS_TYPES.httpData && (!this.httpDataAddress.name || !this.httpDataAddress.baseUrl)) {
      return false;
    }else{
      return true;
    }
  }
}
