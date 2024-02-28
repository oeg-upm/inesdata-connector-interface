import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {CatalogBrowserService} from "../../../shared/services/catalog-browser.service";
import {NotificationService} from "../../../shared/services/notification.service";
import {Router} from "@angular/router";
import {TransferProcessStates} from "../../../shared/models/transfer-process-states";
import {ContractOffer} from "../../../shared/models/contract-offer";
import {NegotiationResult} from "../../../shared/models/negotiation-result";
import {ContractNegotiation, ContractNegotiationRequest} from "../../../shared/models/edc-connector-entities";

interface RunningTransferProcess {
  processId: string;
  assetId?: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'app-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  filteredContractOffers$: Observable<ContractOffer[]> = of([]);
  searchText = '';
  runningTransferProcesses: RunningTransferProcess[] = [];
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>(); // contractOfferId, NegotiationResult
  finishedNegotiations: Map<string, ContractNegotiation> = new Map<string, ContractNegotiation>(); // contractOfferId, contractAgreementId
  private fetch$ = new BehaviorSubject(null);
  private pollingHandleNegotiation?: any;

  constructor(private apiService: CatalogBrowserService,
              public dialog: MatDialog,
              private router: Router,
              private notificationService: NotificationService,
              @Inject('HOME_CONNECTOR_STORAGE_ACCOUNT') private homeConnectorStorageAccount: string) {
  }

  ngOnInit(): void {
    this.filteredContractOffers$ = this.fetch$
      .pipe(
        switchMap(() => {
          const contractOffers$ = this.apiService.getContractOffersFromConnector();
          return !!this.searchText ?
            contractOffers$.pipe(map(contractOffers => contractOffers.filter(contractOffer => contractOffer.id.toLowerCase().includes(this.searchText))))
            :
            contractOffers$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

  isBusy(contractOffer: ContractOffer) {
    return this.runningNegotiations.get(contractOffer.id) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
  }

  getState(contractOffer: ContractOffer): string {
    const transferProcess = this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
    if (transferProcess) {
      return TransferProcessStates[transferProcess.state];
    }

    const negotiation = this.runningNegotiations.get(contractOffer.id);
    if (negotiation) {
      return 'negotiating';
    }

    return '';
  }

  isNegotiated(contractOffer: ContractOffer) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }

}
