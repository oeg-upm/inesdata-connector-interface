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
    sharedUrl: "",
    participantId: "",
    storageAccount: '',
    storageExplorerLinkTemplate: '',
    theme: '',
    service: {
      asset: {
        baseUrl: '/v3/assets',
        storageUrl: '/s3assets',
        get: '/',
        getAll: '/request',
        count: '/pagination/count?type=asset'
      },
      contractAgreement: {
        baseUrl: '/v3/contractagreements',
        get: '/',
        getAll: '/request',
        getNegotiation: '/negotiation',
        count: '/pagination/count?type=contractAgreement'
      },
      policy: {
        baseUrl: '/v3/policydefinitions',
        get: '/',
        getAll: '/request',
        count: '/pagination/count?type=policyDefinition'
      },
      contractDefinition: {
        baseUrl: '/v3/contractdefinitions',
        get: '/',
        getAll: '/request',
        count: '/pagination/count?type=contractDefinition'
      },
      contractNegotiation: {
        baseUrl: '/v3/contractnegotiations',
        get: '/',
        agreement: '/agreement',
        state: '/state',
        terminate: '/terminate',
        getAll: '/request'
      },
      transferProcess: {
        baseUrl: '/v3/transferprocesses',
        get: '/',
        deprovision: '/deprovision',
        state: '/state',
        terminate: '/terminate',
        getAll: '/request',
        count: '/pagination/count?type=transferProcess'
      },
      vocabulary: {
        baseUrl: '/connector-vocabularies',
        getAll: '/request-by-connector'
      },
      federatedCatalog: {
        count: '/pagination/count?type=federatedCatalog',
        paginationRequest: '/request'
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
