import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractsRoutingModule } from './contracts-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonModule} from '@angular/material/button';

import { ContractViewerComponent } from './contract-viewer/contract-viewer.component';
import { CatalogBrowserTransferDialog } from './catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component';

@NgModule({
  declarations: [
    ContractViewerComponent,
    CatalogBrowserTransferDialog
  ],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FlexLayoutModule
  ]
})
export class ContractsModule { }
