import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GroupMembershipService } from './group-membership';
import { RightsManagementService } from './rights-management';
import { environment } from '../Environments/environment';

describe('DL lookup services', () => {
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  it('Group Membership encodes the DL name and always sends source', () => {
    TestBed.inject(GroupMembershipService).getByDLName('Sales & Ops #1', 'Cloud').subscribe();
    const req = ctrl.expectOne((r) => r.url === `${environment.apiBaseUrl}/GroupMembership/Sales%20%26%20Ops%20%231`);
    expect(req.request.params.get('source')).toBe('Cloud');
    req.flush({});
  });

  it('Rights Management encodes the DL name and always sends source', () => {
    TestBed.inject(RightsManagementService).getByDLName('TEST-DL-CRUD-', 'OnPrem').subscribe();
    const req = ctrl.expectOne((r) => r.url === `${environment.apiBaseUrl}/RightsManagement/TEST-DL-CRUD-`);
    expect(req.request.params.get('source')).toBe('OnPrem');
    req.flush({});
  });
});
