import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { savePostLoginRedirect } from '../Shared/post-login-redirect';

/** The approval page handles its own 401s (with a login-loop guard). */
const SELF_HANDLED_401 = /\/Approval\//i;

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err && err.status === 401 && !SELF_HANDLED_401.test(req.url)) {
        // Remember where the user was so they come back after signing in.
        // savePostLoginRedirect ignores unsafe paths and /login itself.
        savePostLoginRedirect(router.url);
        try {
          router.navigate(['/login']);
        } catch {
          // ignore navigation errors during tests
        }
      }
      return throwError(() => err);
    })
  );
};
