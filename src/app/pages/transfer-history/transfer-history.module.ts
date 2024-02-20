import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferHistoryRoutingModule } from './transfer-history-routing.module'
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';

import {ReplacePipe} from "./pipes/replace.pipe";
import {SafePipe} from "./pipes/safe.pipe";

import { TransferHistoryViewerComponent } from './transfer-history-viewer.component';

@NgModule({
  declarations: [
    TransferHistoryViewerComponent,
    ReplacePipe,
    SafePipe
  ],
  imports: [
    CommonModule,
    TransferHistoryRoutingModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    MatPaginatorModule,
    MatCardModule,
    MatListModule,
    MatExpansionModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule
  ]
})
export class TransferHistoryModule { }
