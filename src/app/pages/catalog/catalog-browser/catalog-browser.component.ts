import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CatalogBrowserService } from "../../../shared/services/catalog-browser.service";
import { DataOffer } from 'src/app/shared/models/data-offer';
import { ContractOffersViewerComponent } from '../contract-offers-viewer/contract-offers-viewer.component';
import { Policy } from 'src/app/shared/models/edc-connector-entities';



@Component({
  selector: 'app-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  filteredDataOffers$: Observable<DataOffer[]> = of([]);
  searchText = '';

  private fetch$ = new BehaviorSubject(null);

  constructor(private apiService: CatalogBrowserService,
    public dialog: MatDialog,
    @Inject('HOME_CONNECTOR_STORAGE_ACCOUNT') private homeConnectorStorageAccount: string) {
  }

  ngOnInit(): void {
    this.filteredDataOffers$ = this.fetch$
      .pipe(
        switchMap(() => {
          const contractOffers$ = this.apiService.getDataOffers();
          return !!this.searchText ?
            contractOffers$.pipe(map(contractOffers => contractOffers.filter(contractOffer => contractOffer.assetId.toLowerCase().includes(this.searchText))))
            :
            contractOffers$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }


  viewContractOffers(assetId: string, contractOffers: Policy[], originator: string, properties: any) {
    this.dialog.open(ContractOffersViewerComponent, {
      data: {
        assetId: assetId,
        contractOffers: contractOffers,
        originator: originator,
        properties: properties
      },
    });
  }
}
