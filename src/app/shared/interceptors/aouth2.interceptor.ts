import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, defer, from, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/auth.service';
//import { NotificationService } from '../services/notifications.service';

@Injectable()
export class Oauth2Interceptor implements HttpInterceptor {
  private static ERROR_INVALID_GRANT = 'invalid_grant';

  // Declare AuthService to avoid Circular dependency in DI (NG0200)
  authService: AuthService;

  constructor(private readonly injector: Injector) {
  }
  /**
   * Intercepts server errors
   *
   * @param request the request
   * @param next the http handler
   * @returns the request if no errors
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.authService = this.injector.get(AuthService);

    console.debug('Referring a request to the resource ' + request.url, request);
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, request, next);
      })
    );
  }

  /**
   * Handles the error. If a 401 error occurs, the user is authenticated again and the request is retried.
   *
   * @param error the error
   * @param request the request
   * @param next the http handler
   * @returns the error
   */
  handleError(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    switch (error.status) {

      case 400:

        console.debug('The request has not been correctly conformed; status code: ' + error.status, request, error)

        // Check if error message is invalid_grant, it's an OAuth request token error
        if (Oauth2Interceptor.ERROR_INVALID_GRANT === error.error[Object.keys(error.error)[0]]) {

          // User token problems or with expired token, user must login again
          // Try to redirect to login page, user could have an active session in OAuth server
          this.authService.isRefreshTokenExpired();
        }

        break;

      case 401:

        // Token expired. Try to authenticate and retry the request with new token
        console.debug('The request has not been completed because it lacks valid authentication credentials for the requested resource; status code: ' + error.status, request, error)

        // Auth service returns a Promise and we need to convert it to an Observable in order to manage the response syncronously
        const refreshTokenObservable = defer(() => from(this.authService.refreshToken()));

        return refreshTokenObservable.pipe(
          switchMap(() => {

            // Clone request
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${this.authService.getAccessToken()}`
              }
            });

            // Retry request with new access token
            console.debug('Referring a request to the resource ' + request.url, request)

            return next.handle(request);
          }),
          catchError(_ => {
            return throwError(() => error);
          })
        );

      case 403:

        if (this.authService.isAuthenticated()) {
          // User without privileges
          console.debug('The request has not been completed because the client is forbidden from the requested resource; status code: ' + error.status, request, error)
          console.error(error.error);
        } else {
          // User without token or with expired token
          this.authService.logout();
        }

        break;

      case 404:

        console.debug('The request has not been completed because the requested resource is not found; status code: ' + error.status, request, error)
        console.error(error.error);
        break;

      default:

        // Error managed by general error handling
        console.debug('An error occurred while processing your operation with status code ' + error.status, request, error)
        console.error(error.error);
    }

    return throwError(() => error);
  }
}
