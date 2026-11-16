import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { BehaviorSubject } from 'rxjs';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let router: Router;
  let navigateByUrl: jasmine.Spy;
  let inProgress$: BehaviorSubject<InteractionStatus>;
  let msalInstanceSpy: jasmine.SpyObj<{
    getAllAccounts: () => any[];
    getActiveAccount: () => any;
    setActiveAccount: (account: any) => void;
  }>;
  let msalServiceMock: { instance: any; loginRedirect: jasmine.Spy };
  const account = { homeAccountId: 'home', localAccountId: 'local', environment: 'env', tenantId: 'tenant' };

  beforeEach(async () => {
    sessionStorage.clear();
    inProgress$ = new BehaviorSubject<InteractionStatus>(InteractionStatus.Startup);
    msalInstanceSpy = jasmine.createSpyObj('MsalInstance', ['getAllAccounts', 'getActiveAccount', 'setActiveAccount']);
    msalInstanceSpy.getActiveAccount.and.returnValue(null);
    msalServiceMock = { instance: msalInstanceSpy, loginRedirect: jasmine.createSpy('loginRedirect') };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: MsalService, useValue: msalServiceMock },
        { provide: MsalBroadcastService, useValue: { inProgress$ } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateByUrl = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    component = TestBed.createComponent(LoginComponent).componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('waits until MSAL has finished processing the redirect', () => {
    msalInstanceSpy.getAllAccounts.and.returnValue([account]);
    component.ngOnInit();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('goes to the dashboard when signed in and nothing was saved', () => {
    msalInstanceSpy.getAllAccounts.and.returnValue([account]);
    component.ngOnInit();
    inProgress$.next(InteractionStatus.None);

    expect(msalInstanceSpy.setActiveAccount).toHaveBeenCalledWith(account);
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('returns to the saved approval URL after login and clears it', () => {
    sessionStorage.setItem('postLoginRedirect', '/approval?id=42');
    msalInstanceSpy.getAllAccounts.and.returnValue([account]);
    component.ngOnInit();
    inProgress$.next(InteractionStatus.None);

    expect(navigateByUrl).toHaveBeenCalledWith('/approval?id=42');
    expect(sessionStorage.getItem('postLoginRedirect')).toBeNull();
  });

  it('ignores an unsafe saved URL (open redirect) and goes to the dashboard', () => {
    sessionStorage.setItem('postLoginRedirect', '//evil.com');
    msalInstanceSpy.getAllAccounts.and.returnValue([account]);
    component.ngOnInit();
    inProgress$.next(InteractionStatus.None);

    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('keeps an already active account', () => {
    msalInstanceSpy.getActiveAccount.and.returnValue(account);
    msalInstanceSpy.getAllAccounts.and.returnValue([{ ...account, homeAccountId: 'other' }, account]);
    component.ngOnInit();
    inProgress$.next(InteractionStatus.None);

    expect(msalInstanceSpy.setActiveAccount).not.toHaveBeenCalled();
  });

  it('redirects to SSO when no account exists', () => {
    msalInstanceSpy.getAllAccounts.and.returnValue([]);
    component.ngOnInit();
    inProgress$.next(InteractionStatus.None);

    expect(msalServiceMock.loginRedirect).toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
