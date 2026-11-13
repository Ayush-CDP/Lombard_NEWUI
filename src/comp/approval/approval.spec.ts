import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Approval } from './approval';
import { ApprovalService } from '../../services/approval';
import { Auth } from '../../services/auth';

describe('Approval page', () => {
  let fixture: ComponentFixture<Approval>;
  let component: Approval;
  let approvalService: jasmine.SpyObj<ApprovalService>;
  let auth: jasmine.SpyObj<Auth>;
  let queryId: string | null;

  const requestData = {
    dlName: 'TEST-DL-CRUD-',
    empIds: 'ilom32725,ilom41623',
    action: 'Add',
    event: 'Membership | OnPrem',
    approvalStatus: 'Pending',
    requestorId: 'lomad',
    requestorName: 'ADSUPPORT /IT/ICICILOMBARD/PRBD',
  };

  async function setup(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Approval],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ApprovalService, useValue: approvalService },
        { provide: Auth, useValue: auth },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryId ? { id: queryId } : {}) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Approval);
    component = fixture.componentInstance;
    fixture.detectChanges(); // runs ngOnInit
    await fixture.whenStable();
  }

  beforeEach(() => {
    queryId = '42';
    approvalService = jasmine.createSpyObj('ApprovalService', ['getRequest', 'approve', 'reject']);
    approvalService.getRequest.and.returnValue(of({ status: 200, message: 'ok', data: { ...requestData } }));
    auth = jasmine.createSpyObj('Auth', ['hasFeatureAccess', 'getCurrentUser']);
    auth.hasFeatureAccess.and.returnValue(true);
  });

  it('loads the request and shows "Requested By"', async () => {
    await setup();
    expect(approvalService.getRequest).toHaveBeenCalledWith('42');
    expect(component.approvalHeader).toBe('DL Membership Request');
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('Requested By');
    expect(text).toContain('ADSUPPORT /IT/ICICILOMBARD/PRBD');
    expect(text).toContain('(lomad)');
  });

  it('hides "Requested By" for older requests without requestor data', async () => {
    approvalService.getRequest.and.returnValue(of({ status: 200, data: { ...requestData, requestorId: null, requestorName: null } }));
    await setup();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Requested By');
  });

  it('approve: success text hides the buttons and updates status', async () => {
    approvalService.approve.and.returnValue(of('Approved Successfully'));
    await setup();

    component.approve();

    expect(approvalService.approve).toHaveBeenCalledWith('42');
    expect(component.alertType).toBe('success');
    expect(component.message).toBe('Approved Successfully');
    expect(component.actions).toBeFalse();
    expect(component.request.approvalStatus).toBe('Approved');
  });

  it('reject: success text hides the buttons', async () => {
    approvalService.reject.and.returnValue(of('Rejected Successfully'));
    await setup();

    component.reject();

    expect(component.alertType).toBe('success');
    expect(component.actions).toBeFalse();
    expect(component.request.approvalStatus).toBe('Rejected');
  });

  it('approve: "500 Server Error" text is shown as an error and buttons stay', async () => {
    approvalService.approve.and.returnValue(of('500 Server Error'));
    await setup();

    component.approve();

    expect(component.alertType).toBe('error');
    expect(component.message).toBe('500 Server Error');
    expect(component.actions).toBeTrue();
    expect(component.processing).toBeFalse();
  });

  it('approve: HTTP error with a text body is shown', async () => {
    approvalService.approve.and.returnValue(throwError(() => ({ status: 500, error: '500 Server Error' })));
    await setup();

    component.approve();

    expect(component.alertType).toBe('error');
    expect(component.message).toBe('500 Server Error');
  });

  it('ignores a second click while a decision is in flight', async () => {
    await setup();
    component.processing = true;

    component.approve();

    expect(approvalService.approve).not.toHaveBeenCalled();
  });

  it('shows an error and makes no API call when the link has no id', async () => {
    queryId = null;
    await setup();
    expect(approvalService.getRequest).not.toHaveBeenCalled();
    expect(component.ERRmessage).toBe('Invalid approval link.');
  });

  it('denies access without the Feature.Access role', async () => {
    auth.hasFeatureAccess.and.returnValue(false);
    await setup();
    expect(approvalService.getRequest).not.toHaveBeenCalled();
    expect(component.ERRmessage).toBe('Access denied.');
  });
});
