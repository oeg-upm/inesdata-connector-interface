import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AssetsRoutingModule} from "./assets-routing.module"
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
import {MatDialogModule} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { AssetViewerComponent } from './asset-viewer/asset-viewer.component';
import { AssetEditorDialog } from './asset-editor-dialog/asset-editor-dialog.component';

@NgModule({
  declarations: [
    AssetViewerComponent,
    AssetEditorDialog
  ],
  imports: [
    CommonModule,
    AssetsRoutingModule,
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
    MatDialogModule,
    MatSelectModule
  ]
})
export class AssetsModule { }
