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
import { environment } from '../Environments/environment';


export function MSALInstanceFactory(): IPublicClientApplication {
 return new PublicClientApplication({
   auth: {
      clientId: environment.msal.clientId,
      authority: environment.msal.authority,
      redirectUri: environment.msal.redirectUri
    }
 });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ["https://graph.microsoft.com/v1.0/me", ["User.Read"]]
    ])
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect
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
