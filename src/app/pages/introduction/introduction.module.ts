import { IntroductionComponent } from './introduction.component';
import { IntroductionRoutingModule } from './introduction-routing.module'
import { NgModule } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { RouterModule } from '@angular/router';


 @NgModule({
  declarations: [IntroductionComponent],
  imports: [
    MatCardModule,
    RouterModule,
    IntroductionRoutingModule
  ]
})
export class IntroductionModule { }
