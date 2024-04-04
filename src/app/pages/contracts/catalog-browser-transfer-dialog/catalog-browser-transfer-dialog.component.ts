import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StorageType} from '../../../shared/models/storage-type';


@Component({
  selector: 'app-catalog-browser-transfer-dialog',
  templateUrl: './catalog-browser-transfer-dialog.component.html',
  styleUrls: ['./catalog-browser-transfer-dialog.component.scss']
})
export class CatalogBrowserTransferDialog {

  name: string = '';
  storageTypeId = '';

  constructor(@Inject('STORAGE_TYPES') public storageTypes: StorageType[],
              private dialogRef: MatDialogRef<CatalogBrowserTransferDialog>,
              @Inject(MAT_DIALOG_DATA) contractDefinition?: any) {
  }

  onTransfer() {
    this.dialogRef.close({storageTypeId: this.storageTypeId});
  }

}