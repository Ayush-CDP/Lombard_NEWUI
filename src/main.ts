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

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    MsalRedirectComponent,
    ...appConfig.providers!,
    provideHttpClient(withInterceptors([loaderInterceptor]))
  ]
})
  .then(appRef => {
    // 🟩 IMPORTANT: initialize MSAL manually for standalone APP
    const msal = appRef.injector.get(MsalService);
    msal.instance.initialize();
  })
  .catch(err => console.error(err));
