import { CanActivateFn } from '@angular/router';
import { savePostLoginRedirect } from '../Shared/post-login-redirect';

/**
 * Runs before MsalGuard: records the requested URL (e.g. /approval?id=...)
 * so LoginComponent can return the user there after the Microsoft login
 * redirect. The page itself clears it once it has loaded.
 */
export const rememberReturnUrlGuard: CanActivateFn = (_route, state) => {
  savePostLoginRedirect(state.url);
  return true;
};
