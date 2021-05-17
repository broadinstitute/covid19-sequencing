import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ZingchartAngularModule } from 'zingchart-angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    ZingchartAngularModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
