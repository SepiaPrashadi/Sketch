import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
}).catch((err) => console.error(err));
