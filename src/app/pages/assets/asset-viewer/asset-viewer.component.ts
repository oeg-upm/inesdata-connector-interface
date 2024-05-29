import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AssetInput, Asset} from "../../../shared/models/edc-connector-entities";
import {AssetService} from "../../../shared/services/asset.service";
import {AssetEditorDialog} from "../asset-editor-dialog/asset-editor-dialog.component";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import {NotificationService} from "../../../shared/services/notification.service";
import { DATA_ADDRESS_TYPES } from 'src/app/shared/utils/app.constants';

@Component({
  selector: 'app-asset-viewer',
  templateUrl: './asset-viewer.component.html',
  styleUrls: ['./asset-viewer.component.scss']
})
export class AssetViewerComponent implements OnInit {

  filteredAssets$: Observable<Asset[]> = of([]);
  searchText = '';
  isTransferring = false;
  private fetch$ = new BehaviorSubject(null);

  constructor(private assetService: AssetService,
              private notificationService: NotificationService,
              private readonly dialog: MatDialog) {
}

  private showError(error: string, errorMessage: string) {
    this.notificationService.showError(errorMessage);
    console.error(error);
  }

  ngOnInit(): void {
    this.filteredAssets$ = this.fetch$.
    pipe(
        switchMap(() => {
          const assets$ = this.assetService.requestAssets();
          return !!this.searchText
            ? assets$.pipe(map(assets => assets.filter(asset => asset.id.toLowerCase().includes(this.searchText))))
            : assets$;
        })
      );
  }

  isBusy() {
    return this.isTransferring;
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onDelete(asset: Asset) {
    const dialogData = ConfirmDialogModel.forDelete("asset", `"${asset.id}"`)
    const ref = this.dialog.open(ConfirmationDialogComponent, {maxWidth: "30%", data: dialogData});

    ref.afterClosed().subscribe({
      next: res => {
        if (res) {
          this.assetService.removeAsset(asset.id).subscribe({
            next: () => this.fetch$.next(null),
            error: err => this.showError(err, "This asset cannot be deleted"),
            complete: () => this.notificationService.showInfo("Successfully deleted")
          });
        }
      }
    });
  }

  onCreate() {
    const dialogRef = this.dialog.open(AssetEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { assetInput?: AssetInput }) => {
      const newAsset = result?.assetInput;
      if (newAsset) {
        if(newAsset.dataAddress.type!==DATA_ADDRESS_TYPES.inesDataStore){
          this.assetService.createAsset(newAsset).subscribe({
            next: ()=> this.fetch$.next(null),
            error: err => this.showError(err, "This asset cannot be created"),
            complete: () => this.notificationService.showInfo("Successfully created"),
          })
        }else{
          this.assetService.createStorageAsset(newAsset).subscribe({
            next: ()=> this.fetch$.next(null),
            error: err => this.showError(err, "This asset cannot be created"),
            complete: () => this.notificationService.showInfo("Successfully created"),
          })
        }

      }
  })
}
}
