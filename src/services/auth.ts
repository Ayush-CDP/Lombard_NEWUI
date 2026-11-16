import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../Environments/environment';
import { savePostLoginRedirect } from '../Shared/post-login-redirect';

export interface CurrentUser {
  /** NT / employee ID only (no domain, no "DOMAIN\" prefix), e.g. "lomad". */
  id: string;
  /** Display name, e.g. "ADSUPPORT /IT/ICICILOMBARD/PRBD". */
  name: string;
}

// Same character set the API accepts for IDs.
const USER_ID_PATTERN = /^[A-Za-z0-9._-]+$/;

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

  /**
   * Logged-in user taken from the active MSAL (Azure AD) account.
   * Returns null when nobody is signed in or no valid ID can be derived.
   */
  getCurrentUser(): CurrentUser | null {
    const account = this.msal.instance.getActiveAccount()
      ?? this.msal.instance.getAllAccounts()[0];
    if (!account) {
      return null;
    }

    const claims: any = account.idTokenClaims ?? {};

    // Prefer the on-prem sAMAccountName if the tenant emits it as an optional
    // claim; otherwise fall back to the local part of the UPN / username.
    const rawId: string =
      claims.onprem_sam_account_name
      || claims.samAccountName
      || claims.preferred_username
      || account.username
      || '';

    const id = Auth.normaliseUserId(rawId);
    if (!id) {
      return null;
    }

    const name = String(claims.name || account.name || id).trim();
    return { id, name };
  }

  /**
   * Starts the Microsoft login redirect and remembers `returnUrl` so the user
   * is brought back to it afterwards (see LoginComponent).
   */
  startLogin(returnUrl: string): void {
    savePostLoginRedirect(returnUrl);
    this.msal.loginRedirect({ scopes: [environment.msal.apiScope] });
  }

  /** "DOMAIN\\lomad" / "lomad@icicilombard.com" / "lomad" → "lomad". */
  private static normaliseUserId(raw: string): string {
    let value = String(raw ?? '').trim();
    const slash = value.lastIndexOf('\\');
    if (slash >= 0) {
      value = value.substring(slash + 1);
    }
    const at = value.indexOf('@');
    if (at >= 0) {
      value = value.substring(0, at);
    }
    return USER_ID_PATTERN.test(value) ? value : '';
  }
}
