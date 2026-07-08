import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';


@Injectable({
  providedIn: 'root',
})
export class Auth {

  constructor(private msal: MsalService) {}

  hasFeatureAccess(): boolean {
    const account = this.msal.instance.getActiveAccount();
    const claims: any = account?.idTokenClaims;
    const roles: string[] = claims?.roles || [];
    
    return roles.includes('Feature.Access');
  }
}
