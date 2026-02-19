export const environment = {
  production: false,

  apiBaseUrl: 'https://localhost:44329/api',
    //apiBaseUrl: 'https://localhost:7001/api',
  //https://localhost:44329/swagger

  msal: {
    clientId: 'b823223e-37c8-4776-a1f3-93f0045a9e2d',
    authority: 'https://login.microsoftonline.com/5a64b65b-19d2-4b0f-b1de-60f30364b163',
    redirectUri: 'http://localhost:4200'
  }

   // apiBaseUrl: 'http://10.235.84.7:5000/api',

  // msal: {
  //   clientId: 'f75eb10f-3889-48fc-b8e8-106eebbd671b',
  //   authority: 'https://login.microsoftonline.com/bcb33dcc-236e-4431-8beb-bd065435b8da',
  //   redirectUri: 'http://localhost:4200/'
  // }
};
