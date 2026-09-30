import { ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MSAL_GUARD_CONFIG,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalInterceptor
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  IPublicClientApplication,
  InteractionType
} from '@azure/msal-browser';
import { environment } from '../Environments/environment';

// The scope your API exposes. Get this exact value from your Azure AD admin,
// e.g. "api://<api-client-id>/access_as_user". Put it in environment.ts as
// environment.msal.apiScope, then this reads it.
const API_SCOPE = environment.msal.apiScope;

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
    protectedResourceMap: new Map<string, Array<string>>([
      // Microsoft Graph (kept from your existing setup)
      ["https://graph.microsoft.com/v1.0/me", ["User.Read"]],

      // YOUR API — every call to this base URL now gets an access token attached.
      [environment.apiBaseUrl, [API_SCOPE]]
    ])
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    // Ask for the API scope at login so the token is ready for API calls.
    authRequest: {
      scopes: [API_SCOPE]
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    // Register HttpClient and let DI-provided interceptors (MsalInterceptor) run.
    provideHttpClient(withInterceptorsFromDi()),

    // MSAL core providers
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },

    // THIS is what actually attaches the token to outgoing HTTP calls.
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },

    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};