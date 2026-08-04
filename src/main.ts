import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MsalRedirectComponent, MsalService } from '@azure/msal-angular';
import { appConfig } from './app/app.config';
import { loaderInterceptor } from './comp/SharedComps/loader/loader-interceptor-interceptor';
import { authErrorInterceptor } from './app/auth-error-interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    MsalRedirectComponent,
    ...appConfig.providers!,
    provideHttpClient(withInterceptors([loaderInterceptor, authErrorInterceptor]))
  ]
})
  .then(() => {
    // MSAL initialization is handled in App.ngOnInit to avoid duplicate initialization
  })
  .catch(() => {
    // Bootstrap failed. Do not log the raw error object (may contain
    // tokens / PII). Surface a generic message instead.
    document.body.innerText = 'Application failed to start. Please contact support.';
  });