import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login';
import { MsalService } from '@azure/msal-angular';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let router: Router;
  let msalInstanceSpy: jasmine.SpyObj<{
    getAllAccounts: () => any[];
    setActiveAccount: (account: any) => void;
    loginRedirect: () => void;
  }>;
  let msalServiceMock: MsalService;

  beforeEach(async () => {
    msalInstanceSpy = jasmine.createSpyObj('MsalInstance', [
      'getAllAccounts',
      'setActiveAccount',
    ]);

    msalServiceMock = {
      instance: msalInstanceSpy,
      loginRedirect: jasmine.createSpy('loginRedirect'),
    } as unknown as MsalService;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: MsalService, useValue: msalServiceMock },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    component = TestBed.createComponent(LoginComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard when an account already exists', () => {
    const mockAccount = { homeAccountId: 'home', localAccountId: 'local', environment: 'env', tenantId: 'tenant' };
    msalInstanceSpy.getAllAccounts.and.returnValue([mockAccount]);
    const navigateSpy = spyOn(router, 'navigate');

    component.ngOnInit();

    expect(msalInstanceSpy.setActiveAccount).toHaveBeenCalledWith(mockAccount);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect to SSO when no account exists', () => {
    msalInstanceSpy.getAllAccounts.and.returnValue([]);
    const loginRedirectSpy = (msalServiceMock as any).loginRedirect as jasmine.Spy;

    component.ngOnInit();

    expect(loginRedirectSpy).toHaveBeenCalled();
  });
});