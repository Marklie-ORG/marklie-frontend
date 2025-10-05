import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { AuthService } from '../services/api/auth.service.js';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private readonly retryHeader = 'x-auth-retry';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    
    // Log cookies before request
    // console.log('Cookies before request:', document.cookie);

    const headers = req.headers
      .set('ngrok-skip-browser-warning', 'true')
      .set('Authorization', accessToken ? `Bearer ${accessToken}` : '');

    const modifiedReq = req.clone({
      headers,
      withCredentials: true
    });

    return next.handle(modifiedReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (!accessToken) {
            return throwError(() => error);
          }
          if (req.url.includes('/auth/refresh')) {
            this.authService.clearTokens();
            this.router.navigate(['/']);
            return throwError(() => error);
          }
          if (req.headers.has(this.retryHeader)) {
            return throwError(() => error);
          }
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((data: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(data.accessToken);
          this.authService.setToken(data.accessToken);

          return next.handle(this.addTokenToRequest(request, data.accessToken, true));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.clearTokens();
          this.router.navigate(['/']);
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenToRequest(request, token, true)))
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string, markRetry = false): HttpRequest<any> {
    let headers = request.headers
      .set('Authorization', `Bearer ${token}`)
      .set('ngrok-skip-browser-warning', 'true');

    if (markRetry) {
      headers = headers.set(this.retryHeader, 'true');
    }

    return request.clone({
      headers,
      withCredentials: true
    });
  }
}
