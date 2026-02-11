import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app.component';
import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection()
  ]
}).catch((err) => console.error(err));