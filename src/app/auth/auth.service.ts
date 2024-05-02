import { environment } from 'src/environments/environment';
import { Injectable, EventEmitter } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Member } from '../shared/models/member.model';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OAuthService, NullValidationHandler, AuthConfig, TokenResponse } from 'angular-oauth2-oidc';

/**
 * Injectable: Authentication service
 *
 * Using the angular-oauth-oidc module (https://github.com/manfredsteyer/angular-oauth2-oidc)
 * with process improvements from sample (https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // OAuth service configuration
  authConfig: AuthConfig = {
    issuer: environment.runtime.oauth2.issuer,
    redirectUri: window.location.origin + environment.runtime.oauth2.redirectPath,
    clientId: environment.runtime.oauth2.clientId,
    scope: environment.runtime.oauth2.scope,
    responseType: environment.runtime.oauth2.responseType,
    useSilentRefresh: false,
    requireHttps: false,
    showDebugInformation: environment.runtime.oauth2.showDebugInformation
  }

  member: Member;

  jwtHelper: JwtHelperService = new JwtHelperService();

  // User change emitter to reload components that depends on the logged user (e.g: header menu)
  userChange: EventEmitter<Member> = new EventEmitter();

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

    // Subject for refresh token expiration. The SessionExpired component is subscribed to this subject


  /**
   * Creates an instance of auth service
   *
   * @param router the router
   * @param oauthService OAuth 2.0 service
   */
  constructor(private router: Router,
    public oauthService: OAuthService) {

    this.configureOAuth();
    
    if (this.oauthService.hasValidAccessToken()) {
      // Recover the user from session
      this.createMember();
    }
  }

  /**
   * Configure OAuth service
   */
  private configureOAuth() {

    this.oauthService.configure(this.authConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();

    // Noticed changes to access_token (most likely from another tab), updating isAuthenticated
    this.oauthService.events
      .subscribe(_ => {
        this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
      });
    this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

    // Automatically load user profile
    this.oauthService.events
      .pipe(filter(e => ['token_received'].includes(e.type)))
      .subscribe(e => {
        this.oauthService.loadUserProfile();
        this.createMember();
        this.userChange.emit(this.getCurrentMember());
      });

    // Session expired
    this.oauthService.events
      .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
      .subscribe(e => this.login());

    // For SSO logout
    this.oauthService.events.pipe(filter(e => e.type === 'session_changed')).subscribe(e => {
      this.logout();
    });
  }

  /**
   * Run the initial login sequence. Used by the app component at the app start
   *
   * @returns Promise
   */
  public runInitialLoginSequence(): Promise<void> {

    // First we have to check to see how the OAuth is currently configured
    return this.oauthService.loadDiscoveryDocument()

      // Try to login in the OAuth server
      .then(() => this.oauthService.tryLoginCodeFlow())

      // Check if has valid access token
      .then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          return Promise.resolve();
        }
      })

      .then(() => {
        this.isDoneLoadingSubject$.next(true);
        // Remove query params
        this.router.navigate(['']);
      })
      .catch(() => this.isDoneLoadingSubject$.next(true));
  }

  /**
   * Action method that throws the authentication with OAuth 2.0
   */
  public login(): void {
    // Clean session data
    this.removeSession();

    this.oauthService.initLoginFlow();
  }

  /**
   * Determines if the user is authenticated
   *
   * @returns true if authenticated
   */
  public isAuthenticated(): boolean {
    if (this.getRefreshToken() && this.jwtHelper.isTokenExpired(this.getRefreshToken())) {
      this.login();
    }

    return this.member && this.getAccessToken() && !this.jwtHelper.isTokenExpired(this.getRefreshToken());
  }

  /**
   * Determines if the refresh token is expired
   *
   * @returns true if refresh token is expired
   */
  isRefreshTokenExpired(): boolean {

    const tokenExpired = this.jwtHelper.isTokenExpired(this.getRefreshToken());

    if (this.getRefreshToken() == null) {
      // Token doesn't exist, then redirect to login page
      this.login();
    }

    return tokenExpired;
  }

  /**
   * Get current access token
   *
   * @returns Access token
   */
  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  /**
   * Get current refresh token
   * @returns Refresh token
   */
  public getRefreshToken(): string {
    return this.oauthService.getRefreshToken();
  }

  /**
   * Refresh token
   *
   * @returns Promise with TokenResponse
   */
  public refreshToken(): Promise<TokenResponse> {
    return this.oauthService.refreshToken();
  }

  /**
   * Check if access token is valid
   *
   * @returns If has valid token
   */
  public hasValidToken(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  /**
   * Get current member
   *
   * @returns current member
   */
  public getCurrentMember(): Member {

    return this.member;
  }

  /**
 * Creates Member object with the user claims and roles
 */
  public createMember(): void {

    this.member = {} as Member;

    if (this.oauthService.getIdentityClaims() != null) {
      this.member.name = (this.oauthService.getIdentityClaims() as any).name;
      this.member.email = (this.oauthService.getIdentityClaims() as any).email;
      this.member.username = (this.oauthService.getIdentityClaims() as any).preferred_username;
      this.member.id = (this.oauthService.getIdentityClaims() as any).sub;
      this.member.firstName = (this.oauthService.getIdentityClaims() as any).given_name;
      this.member.lastName = (this.oauthService.getIdentityClaims() as any).family_name;
    }

    if (this.oauthService.getAccessToken() != null) {
      const decodedToken = this.jwtHelper.decodeToken(this.oauthService.getAccessToken());
      // Get the resource roles from Keycloak access 
      var clientId = environment.runtime.oauth2.clientId;
      if (clientId) {
        this.member.roles = decodedToken['realm_access']['roles'];
      }      
    }
  }

  /**
   * Logout the ser from app and OAuth IdP
   */
  public logout(): void {

    this.oauthService.revokeTokenAndLogout();

    this.member = null;
    this.userChange.emit(null);

    // Redirect to main page
    this.router.navigate(['']);
  }

  /**
   * Removes session
   */
  removeSession(): void {
    this.member = null;
    this.userChange.emit(null);

    sessionStorage.removeItem(environment.jwt.storageKey);
    sessionStorage.removeItem(environment.jwt.storageRefreshKey);
  }

  /**
   * Gets user change emitter
   *
   * @returns the event emitter
   */
  getUserChangeEmitter() {
    return this.userChange;
  }
}
