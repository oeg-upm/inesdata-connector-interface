import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LayoutModule } from '@angular/cdk/layout';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { CONNECTOR_CATALOG_API, CONNECTOR_MANAGEMENT_API, DATA_ADDRESS_TYPES } from "./shared/utils/app.constants";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { Oauth2Interceptor } from "./shared/interceptors/aouth2.interceptor";
import { environment } from "../environments/environment";
import { EdcConnectorClient } from "@think-it-labs/edc-connector-client";
import { SharedModule } from './shared/shared.module';

import { AuthService } from './auth/auth.service';
import { JwtHelperService, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { OAuthModule } from 'angular-oauth2-oidc';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';


/**
 * JWT options factory
 * @param authService Auth service
 * @returns jwtOptions factory
 */
 export function jwtOptionsFactory(authService: AuthService){
  const jwtHelper: JwtHelperService = new JwtHelperService;
  return {
      tokenGetter: (): Promise<string> => {
          let accessToken = authService.getAccessToken();
          if (accessToken !== null && jwtHelper.isTokenExpired(accessToken)) {
              return new Promise((resolve) => {
                  authService.refreshToken().then(token => {
                    return resolve(token.access_token);
                  })
              });
          }
          return Promise.resolve(accessToken);
      },
      allowedDomains: environment.jwt.allowedDomains,
      disallowedRoutes: environment.jwt.disallowedRoutes
  }
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    SharedModule,
    HttpClientModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [AuthService]
      }
    }),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: environment.runtime.oauth2.allowedUrls.split(','),
        // Add Auth header with Bearer token to all requests
        sendAccessToken: true
      }
    })
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    AuthService,
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    {
      provide: CONNECTOR_MANAGEMENT_API,
      useFactory: () => environment.runtime.managementApiUrl
    },
    {
      provide: CONNECTOR_CATALOG_API,
      useFactory: () => environment.runtime.catalogUrl
    },
    {
      provide: 'HOME_CONNECTOR_STORAGE_ACCOUNT',
      useFactory: () => environment.runtime.storageAccount
    },
    {
      provide: 'STORAGE_TYPES',
      useFactory: () => [{id: DATA_ADDRESS_TYPES.httpData, name: DATA_ADDRESS_TYPES.httpData}, {id: DATA_ADDRESS_TYPES.amazonS3, name: DATA_ADDRESS_TYPES.amazonS3}, {id: DATA_ADDRESS_TYPES.inesDataStore, name: DATA_ADDRESS_TYPES.inesDataStore}],
    },
    { provide: HTTP_INTERCEPTORS, useClass: Oauth2Interceptor, multi: true },
    {
      provide: EdcConnectorClient,
      useFactory: () => {
        return new EdcConnectorClient.Builder()
          .managementUrl(environment.runtime.managementApiUrl)
          .build();
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
