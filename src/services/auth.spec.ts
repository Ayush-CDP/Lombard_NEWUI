import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';
import { Auth } from './auth';

describe('Auth.getCurrentUser', () => {
  let instance: jasmine.SpyObj<{ getActiveAccount: () => any; getAllAccounts: () => any[] }>;
  let auth: Auth;

  beforeEach(() => {
    instance = jasmine.createSpyObj('MsalInstance', ['getActiveAccount', 'getAllAccounts']);
    instance.getAllAccounts.and.returnValue([]);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MsalService, useValue: { instance } },
      ],
    });
    auth = TestBed.inject(Auth);
  });

  it('returns null when nobody is signed in', () => {
    instance.getActiveAccount.and.returnValue(null);
    expect(auth.getCurrentUser()).toBeNull();
  });

  it('strips the domain from the UPN and uses the name claim', () => {
    instance.getActiveAccount.and.returnValue({
      username: 'lomad@icicilombard.com',
      name: 'fallback',
      idTokenClaims: { preferred_username: 'lomad@icicilombard.com', name: 'ADSUPPORT /IT/ICICILOMBARD/PRBD' },
    });
    expect(auth.getCurrentUser()).toEqual({ id: 'lomad', name: 'ADSUPPORT /IT/ICICILOMBARD/PRBD' });
  });

  it('prefers the on-prem sAMAccountName claim and strips DOMAIN\\', () => {
    instance.getActiveAccount.and.returnValue({
      username: 'first.last@icicilombard.com',
      name: 'First Last',
      idTokenClaims: { onprem_sam_account_name: 'ICICILOMBARD\\ilom35124', preferred_username: 'first.last@icicilombard.com' },
    });
    expect(auth.getCurrentUser()).toEqual({ id: 'ilom35124', name: 'First Last' });
  });

  it('falls back to the first account when no active account is set', () => {
    instance.getActiveAccount.and.returnValue(null);
    instance.getAllAccounts.and.returnValue([{ username: 'lomad@icicilombard.com', name: 'Ad Support', idTokenClaims: {} }]);
    expect(auth.getCurrentUser()).toEqual({ id: 'lomad', name: 'Ad Support' });
  });

  it('startLogin saves the return URL and starts the MSAL redirect', () => {
    sessionStorage.clear();
    const msal = TestBed.inject(MsalService) as any;
    msal.loginRedirect = jasmine.createSpy('loginRedirect');

    auth.startLogin('/approval?id=42');

    expect(sessionStorage.getItem('postLoginRedirect')).toBe('/approval?id=42');
    expect(msal.loginRedirect).toHaveBeenCalled();
    sessionStorage.clear();
  });

  it('returns null when the derived ID has invalid characters', () => {
    instance.getActiveAccount.and.returnValue({ username: 'bad id<script>@x.com', idTokenClaims: {} });
    expect(auth.getCurrentUser()).toBeNull();
  });
});
