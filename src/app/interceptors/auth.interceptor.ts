import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { AuthService } from '../services/api/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    
    // Log cookies before request
    // console.log('Cookies before request:', document.cookie);

    const modifiedReq = req.clone({
      headers: req.headers
        .set('ngrok-skip-browser-warning', 'true')
        .set('Authorization', accessToken ? `Bearer ${accessToken}` : ''),
      withCredentials: true
    });
    
    return next.handle(modifiedReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
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
          
          return next.handle(this.addTokenToRequest(request, data.accessToken));
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
      switchMap(token => next.handle(this.addTokenToRequest(request, token)))
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers
        .set('Authorization', `Bearer ${token}`),
      withCredentials: true
    });
  }
}