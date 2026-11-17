import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

import { LoginComponent } from '../comp/login/login';
import { Dashboard } from '../comp/dashboard/dashboard';

import { AccountUnlockComponent } from '../comp/account-unlock/account-unlock';
import { GalSearchComponent } from '../comp/gal-search/gal-search';
import { GroupMembershipComponent } from '../comp/group-membership/group-membership';
import { RightsManagementComponent } from '../comp/rights-management/rights-management';
import { Approval } from '../comp/approval/approval';
import { rememberReturnUrlGuard } from './remember-return-url.guard';
import { featureAccessGuard } from './feature-access.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [MsalGuard],
    children: [
      // Account Unlock: admins only (Feature.Access); others go to GAL Search.
      { path: 'account-unlock', component: AccountUnlockComponent, canActivate: [featureAccessGuard] },
      { path: 'gal-search', component: GalSearchComponent },
      // GAL Search, Group Membership and Rights Management: all signed-in users.
      { path: 'group-membership', component: GroupMembershipComponent },
      { path: 'rights-management', component: RightsManagementComponent },
      // { path: 'group-membership', redirectTo: 'login'  },
      // { path: 'rights-management', redirectTo: 'login' }, 
      // { path: '', redirectTo: 'group-membership', pathMatch: 'full' } // any logged-in user who hits /dashboard lands on Group Membership
      { path: '', redirectTo: 'gal-search', pathMatch: 'full' }
    ]
  },
  // rememberReturnUrlGuard must run before MsalGuard so the approval link
  // survives the Microsoft login redirect.
  { path: 'approval', component: Approval, canActivate: [rememberReturnUrlGuard, MsalGuard] },
  { path: '**', redirectTo: 'login' }
];
