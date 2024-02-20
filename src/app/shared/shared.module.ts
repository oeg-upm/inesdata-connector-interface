import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';

import {NavigationComponent} from './components/navigation/navigation.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  imports: [
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    CommonModule,
    RouterModule,
    MatButtonModule
  ],
  declarations: [
    NavigationComponent,
    ConfirmationDialogComponent
  ],
  exports: [
    NavigationComponent,
    ConfirmationDialogComponent
  ]
})
export class SharedModule {}
