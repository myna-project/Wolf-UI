import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, retry, take } from 'rxjs/operators';

import { User } from '../_models/user';

import { AuthenticationService } from './../_services/authentication.service';
import { TokenService } from './../_services/token.service';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  private token: string;
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private currentUser: User = new User();

  constructor(private authenticationService: AuthenticationService, private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.currentUser = this.authenticationService.getCurrentUser();
    if (!req.headers.has('Content-Type'))
      req = req.clone({ headers: req.headers.set('Content-Type', 'application/json; charset=utf-8') });

    req = req.clone({ headers: req.headers.set('Accept', 'application/json') });

    if (this.currentUser) {
      req = req.clone({headers: req.headers.set('Authorization', `Basic ${this.currentUser.authdata}`)});
    }

    req = req.clone({ withCredentials: true });

    req = this.addAuthenticationToken(req);

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          if (error.status === 401)
            this.authenticationService.logout();
          if (error.status === 403) {
            if (this.refreshTokenInProgress) {
              return this.refreshTokenSubject.pipe(
                filter(result => result !== null),
                take(1),
                switchMap(() => next.handle(this.addAuthenticationToken(req)))
              );
            } else {
              this.refreshTokenInProgress = true;
              this.refreshTokenSubject.next(null);

              return this.tokenService.getToken().pipe(
                retry(2),
                switchMap((success: any) => {
                  this.refreshTokenSubject.next(success.headers.get('X-CSRF-TOKEN'));
                  this.token = success.headers.get('X-CSRF-TOKEN');
                  return next.handle(this.addAuthenticationToken(req)).pipe(
                    catchError((error: HttpErrorResponse) => {
                      return throwError(error);
                    })
                  );
                }),
                finalize(() => this.refreshTokenInProgress = false)
              );
            }
          } else {
            return throwError(error);
          }
        }
      })
    );
  }

  private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    if (!this.token)
      return request;

    return request.clone({
      headers: request.headers.set('X-CSRF-TOKEN', this.token)
    });
  }
}
