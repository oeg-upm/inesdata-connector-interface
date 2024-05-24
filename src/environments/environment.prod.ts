export const environment = {
  production: true,
  jwt: {
    storageKey: 'access_token',
    storageRefreshKey: 'refresh_token',
    allowedDomains: [/.*/i],
    disallowedRoutes: [/.\/token\.*/i,/.\/public\.*/i]
  },
  runtime: {
    managementApiUrl: '',
    catalogUrl: '',
    storageAccount: '',
    storageExplorerLinkTemplate: '',
    theme: '',
    service: {
      asset: {
        baseUrl: '/v3/assets',
        get: '/',
        getAll: '/request'
      },
      contractAgreement: {
        baseUrl: '/v2/contractagreements',
        get: '/',
        getAll: '/request',
        getNegotiation: '/negotiation'
      },
      policy: {
        baseUrl: '/v2/policydefinitions',
        get: '/',
        getAll: '/request'
      },
      contractDefinition: {
        baseUrl: '/v2/contractdefinitions',
        get: '/',
        getAll: '/request'
      },
      contractNegotiation: {
        baseUrl: '/v2/contractnegotiations',
        get: '/',
        agreement: '/agreement',
        state: '/state',
        terminate: '/terminate',
        getAll: '/request'
      },
      transferProcess: {
        baseUrl: '/v2/transferprocesses',
        get: '/',
        deprovision: '/deprovision',
        state: '/state',
        terminate: '/terminate',
        getAll: '/request'
      },
      vocabulary: {
        baseUrl: '/vocabularies',
        getAll: '/request'
      }
    },
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
