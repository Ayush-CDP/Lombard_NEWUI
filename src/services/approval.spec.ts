import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApprovalService } from './approval';
import { environment } from '../Environments/environment';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let http: HttpTestingController;
  const base = `${environment.apiBaseUrl}/Approval`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApprovalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the request with GET', () => {
    service.getRequest('42').subscribe();
    const req = http.expectOne(`${base}/request/42`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 200, data: {} });
  });

  it('approves with POST and a text response', () => {
    let result = '';
    service.approve('42').subscribe((r) => (result = r));
    const req = http.expectOne(`${base}/approve/42`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('Approved Successfully');
    expect(result).toBe('Approved Successfully');
  });

  it('rejects with POST and a text response', () => {
    let result = '';
    service.reject('42').subscribe((r) => (result = r));
    const req = http.expectOne(`${base}/reject/42`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('Rejected Successfully');
    expect(result).toBe('Rejected Successfully');
  });

  it('URL-encodes the id', () => {
    service.approve('a/b').subscribe();
    const req = http.expectOne(`${base}/approve/a%2Fb`);
    expect(req.request.method).toBe('POST');
    req.flush('Approved Successfully');
  });
});
