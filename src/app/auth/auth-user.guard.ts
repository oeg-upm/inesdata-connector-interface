import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Auth guard for regular user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthUserGuard {

  private isAuthenticated: boolean;

  /**
   * Creates an instance of auth guard
   *
   * @param authService the auth service
   * @param router the router
   */
  constructor(public authService: AuthService, private router: Router) {

    this.authService.isAuthenticated$.subscribe(i => this.isAuthenticated = i);
  }

  /**
   * Determines whether activate the next route
   *
   * @param next the next route
   * @param state the state
   * @returns activate if can be activated
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // Check if the user is logged in or else forces the login process
    return this.authService.isDoneLoading$
      // Filter waits until load is done
      .pipe(filter(isDone => isDone))
      // Execute the auth action, check if is authenticated or do login action
      .pipe(tap(_ => this.isAuthenticated || this.authService.login()))
      // Return if user is authenticated
      .pipe(map(_ => this.isAuthenticated));
  }

}
