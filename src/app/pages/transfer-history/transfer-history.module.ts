import { NgModule } from '@angular/core';
import { TransferHistoryRoutingModule } from './transfer-history-routing.module'
import {ReplacePipe} from "./pipes/replace.pipe";
import {SafePipe} from "./pipes/safe.pipe";

import { TransferHistoryViewerComponent } from './transfer-history-viewer.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    TransferHistoryViewerComponent,
    ReplacePipe,
    SafePipe
  ],
  imports: [
    TransferHistoryRoutingModule,
    SharedModule
  ]
})
export class TransferHistoryModule { }
