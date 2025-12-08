import {  ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';


import {
  MsalModule,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MSAL_GUARD_CONFIG,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MsalService,
  MsalGuard,
  MsalRedirectComponent,
  MsalBroadcastService,
  MsalInterceptor
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  IPublicClientApplication,
  InteractionType
} from '@azure/msal-browser';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: "b823223e-37c8-4776-a1f3-93f0045a9e2d",
      authority: "https://login.microsoftonline.com/5a64b65b-19d2-4b0f-b1de-60f30364b163",
      redirectUri: "http://localhost:4200/"
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap: new Map([
      ["https://graph.microsoft.com/v1.0/me", ["User.Read"]]
    ])
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    // MSAL core providers
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },

    MsalService,
    MsalGuard,
    MsalInterceptor,
    MsalBroadcastService
  ]
};
