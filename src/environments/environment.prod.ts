export const environment = {
  production: true,
  jwt: {
    storageKey: 'access_token',
    storageRefreshKey: 'refresh_token'
  },
  runtime: {
    managementApiUrl: '',
    catalogUrl: '',
    storageAccount: '',
    storageExplorerLinkTemplate: '',
    theme: '',
    oauth2: {
      issuer: '',
      redirectPath: '/',
      clientId: '',
      scope: 'openid profile email',
      responseType: 'code',
      showDebugInformation: false,
      allowedUrls: ''
    }
  }
};
