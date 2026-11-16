export const environment = {
  production: false,

   //apiBaseUrl: 'http://localhost:5000/api', //og
   apiBaseUrl: 'https://localhost:7184/api',//clone
   //apiBaseUrl: 'http://localhost:5265/api',
  // https://localhost:44329/swagger

  // msal: {
  //   clientId: 'b823223e-37c8-4776-a1f3-93f0045a9e2d',
  //   authority: 'https://login.microsoftonline.com/5a64b65b-19d2-4b0f-b1de-60f30364b163',
  //   redirectUri: 'http://localhost:4200'
  // }

  //  apiBaseUrl: 'http://10.235.84.7:5000/api',
// lomabrd
  msal: {
    clientId: 'f75eb10f-3889-48fc-b8e8-106eebbd671b',
    authority: 'https://login.microsoftonline.com/bcb33dcc-236e-4431-8beb-bd065435b8da',
    redirectUri: 'http://localhost:4200/',
    // Must match the API's AzureAd:Audience (LombardAPI_NEW appsettings.json) + scope name.
    apiScope: 'api://f75eb10f-3889-48fc-b8e8-106eebbd671b/access_as_user'
  }
};
