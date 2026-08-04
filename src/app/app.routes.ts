import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

import { LoginComponent } from '../comp/login/login';
import { Dashboard } from '../comp/dashboard/dashboard';

import { AccountUnlockComponent } from '../comp/account-unlock/account-unlock';
import { GalSearchComponent } from '../comp/gal-search/gal-search';
import { GroupMembershipComponent } from '../comp/group-membership/group-membership';
import { RightsManagementComponent } from '../comp/rights-management/rights-management';
import { Approval } from '../comp/approval/approval';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [MsalGuard],
    children: [
      { path: 'account-unlock', component: AccountUnlockComponent },
      { path: 'gal-search', component: GalSearchComponent },
     // { path: 'group-membership', component: GroupMembershipComponent }, /// to avoid unnecessary access to group membership, this route is commented out. It can be uncommented if needed in the future.
      { path: 'group-membership', redirectTo: 'login'  },
      // { path: 'rights-management', component: RightsManagementComponent }, /// to avoid unnecessary access to rights management, this route is commented out. It can be uncommented if needed in the future.
      { path: 'rights-management', redirectTo: 'login' },
      { path: '', redirectTo: 'group-membership', pathMatch: 'full' }
    ]
  },
  { path: 'approval', component: Approval, canActivate: [MsalGuard] },
  { path: '**', redirectTo: 'login' }
];
