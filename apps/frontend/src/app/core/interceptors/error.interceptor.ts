import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((tokenResponse: any) => {
              isRefreshing = false;
              refreshTokenSubject.next(tokenResponse.accessToken);
              
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokenResponse.accessToken}`,
                  'ngrok-skip-browser-warning': 'true'
                }
              });
              return next(newReq);
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              router.navigate(['/auth/login']);
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(token => {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                  'ngrok-skip-browser-warning': 'true'
                }
              });
              return next(newReq);
            })
          );
        }
      }
      
      // If it's a 401 from the refresh endpoint itself, or any other error
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
