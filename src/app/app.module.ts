import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {NoteListComponent} from './note-list/note-list.component';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatToolbarModule} from '@angular/material';
import { StatusComponent } from './status/status.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    NoteListComponent,
    StatusComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
    // ServiceWorkerModule.register('ngsw-worker.js', {enabled: true})
    // ServiceWorkerModule.register('sw.js', {enabled: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js');
      });
    }
  }
}
