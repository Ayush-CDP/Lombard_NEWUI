import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err && err.status === 401) {
        // redirect to login for expired/unauthenticated session
        try {
          router.navigate(['/login']);
        } catch (e) {
          // ignore navigation errors during tests
        }
      }
      return throwError(() => err);
    })
  );
};
