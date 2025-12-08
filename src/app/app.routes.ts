import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

import { Login } from '../comp/login/login';
import { Dashboard } from '../comp/dashboard/dashboard';

import { AccountUnlockComponent } from '../comp/account-unlock/account-unlock';
import { GalSearchComponent } from '../comp/gal-search/gal-search';
import { GroupMembershipComponent } from '../comp/group-membership/group-membership';
import { RightsManagementComponent } from '../comp/rights-management/rights-management';
import { Approval } from '../comp/approval/approval';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [MsalGuard],
    children: [
      { path: 'account-unlock', component: AccountUnlockComponent },
      { path: 'gal-search', component: GalSearchComponent },
      { path: 'group-membership', component: GroupMembershipComponent },
      { path: 'rights-management', component: RightsManagementComponent },
      { path: '', redirectTo: 'account-unlock', pathMatch: 'full' }
    ]
  },
  { path: 'approval', component: Approval },
  { path: '**', redirectTo: 'login' }
];
