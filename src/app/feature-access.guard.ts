import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Screens that need the Entra app role Feature.Access (Group Membership,
 * Rights Management). Users without it go to GAL Search.
 * The API enforces the role as well (403); this only keeps the UI consistent.
 * Do not use on /approval: DL owners normally do not have the role.
 */
export const featureAccessGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.hasFeatureAccess() ? true : inject(Router).parseUrl('/dashboard/gal-search');
};
