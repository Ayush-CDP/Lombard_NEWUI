import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authErrorInterceptor } from './auth-error-interceptor';

describe('authErrorInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let navigate: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(withInterceptors([authErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/dashboard/rights-management');
    navigate = spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    ctrl.verify();
    sessionStorage.clear();
  });

  it('on 401 saves the current page and goes to login', () => {
    http.get('/api/RightsManagement/x').subscribe({ error: () => {} });
    ctrl.expectOne('/api/RightsManagement/x').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('postLoginRedirect')).toBe('/dashboard/rights-management');
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('leaves 401s from /Approval/ to the approval page (loop guard lives there)', () => {
    http.get('/api/Approval/request/1').subscribe({ error: () => {} });
    ctrl.expectOne('/api/Approval/request/1').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(navigate).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('postLoginRedirect')).toBeNull();
  });

  it('ignores other errors', () => {
    http.get('/api/x').subscribe({ error: () => {} });
    ctrl.expectOne('/api/x').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(navigate).not.toHaveBeenCalled();
  });
});
