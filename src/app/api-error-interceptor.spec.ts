import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { apiErrorInterceptor } from './api-error-interceptor';
import { getApiErrorMessage } from '../Shared/http-error';

describe('apiErrorInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  function fail(status: number, body: any, responseType: 'json' | 'text' = 'json'): HttpErrorResponse {
    let caught!: HttpErrorResponse;
    const req$ = responseType === 'text' ? http.get('/api/x', { responseType: 'text' }) : http.get('/api/x');
    req$.subscribe({ error: (e) => (caught = e) });
    ctrl.expectOne('/api/x').flush(body, { status, statusText: 'x' });
    return caught;
  }

  it('429 gets the fixed rate-limit message, keeps the status and does not retry', () => {
    const err = fail(429, null);
    expect(err.status).toBe(429);
    expect(err.error.message).toBe('Too many requests. Please wait a few minutes and try again.');
    // ctrl.verify() in afterEach fails if a retry was sent.
  });

  it('an HTML error page becomes a generic message', () => {
    const err = fail(502, '<!DOCTYPE html><html><body>IIS 502.3</body></html>', 'text');
    expect(err.status).toBe(502);
    expect(err.error.message).toBe('Service temporarily unavailable. Please try again later.');
  });

  it('leaves API JSON errors as they are', () => {
    const body = { success: false, message: 'DL name contains invalid characters.', data: null };
    const err = fail(400, body);
    expect(err.error).toEqual(body);
  });

  it('a 500 ProblemDetails shows the detail text', () => {
    const err = fail(500, {
      title: 'An unexpected error occurred.',
      status: 500,
      detail: 'The request could not be completed. Please contact support if the problem persists.',
    });
    expect(getApiErrorMessage(err, 'x')).toBe(
      'The request could not be completed. Please contact support if the problem persists.'
    );
  });
});
