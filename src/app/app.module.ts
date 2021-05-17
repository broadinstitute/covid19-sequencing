import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

import { ZingchartAngularModule } from 'zingchart-angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    ZingchartAngularModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
