import { APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { CONNECTOR_CATALOG_API, CONNECTOR_MANAGEMENT_API, DATA_ADDRESS_TYPES } from "./shared/utils/app.constants";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { Oauth2Interceptor } from "./shared/interceptors/aouth2.interceptor";
import { environment } from "../environments/environment";
import { EdcConnectorClient } from "@think-it-labs/edc-connector-client";
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from './shared/shared.module';

import { AuthService } from './auth/auth.service';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { OAuthModule, OAuthModuleConfig } from 'angular-oauth2-oidc';

/**
 * Declare the JWT Module configuration. It will be used to work with tokens, like decode the access token
 *
 * @returns JWT Module config
 */
export function jwtOptionsFactory() {
  return {
    tokenGetter: () => {
      return sessionStorage.getItem(environment.jwt.storageKey);
    },
    allowedDomains: environment.runtime.oauth2.allowedUrls.split(',')
  }
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatCardModule,
    SharedModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory
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
      useFactory: () => [{id: DATA_ADDRESS_TYPES.httpData, name: DATA_ADDRESS_TYPES.httpData}, {id: DATA_ADDRESS_TYPES.amazonS3, name: DATA_ADDRESS_TYPES.amazonS3}],
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
