export const environment = {
  production: true,
  apiBaseUrl: 'http://10.235.84.7:5000/api',

  msal: {
    clientId: 'f75eb10f-3889-48fc-b8e8-106eebbd671b',
    authority: 'https://login.microsoftonline.com/bcb33dcc-236e-4431-8beb-bd065435b8da',
    // Deployed app URL. Must also be registered as a SPA redirect URI in the Entra app registration.
    redirectUri: 'https://ilcatalog.icicilombard.com/ui/',
    apiScope: 'api://f75eb10f-3889-48fc-b8e8-106eebbd671b/access_as_user'   
  } 
};
