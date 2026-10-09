import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, { ...appConfig, providers: [...appConfig.providers, { provide: LOCALE_ID, useValue: "es" }] })
  .catch((err) => console.error(err));

