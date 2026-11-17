import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Admin-only screens (Entra app role Feature.Access): Account Unlock.
 * Users without the role go to GAL Search.
 * GAL Search, Group Membership and Rights Management are open to all
 * signed-in users. Do not use on /approval: DL owners normally do not have
 * the role. The API enforces access as well; this only keeps the UI consistent.
 */
export const featureAccessGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.hasFeatureAccess() ? true : inject(Router).parseUrl('/dashboard/gal-search');
};
