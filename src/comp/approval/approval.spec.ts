import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Approval, MSG_FORBIDDEN, MSG_NOT_FOUND, MSG_SESSION } from './approval';
import { ApprovalService } from '../../services/approval';
import { Auth } from '../../services/auth';

describe('Approval page', () => {
  let fixture: ComponentFixture<Approval>;
  let component: Approval;
  let approvalService: jasmine.SpyObj<ApprovalService>;
  let auth: jasmine.SpyObj<Auth>;
  let queryId: string | null;

  const pending = () => ({
    dlName: 'TEST-DL-CRUD-',
    empIds: 'ilom32725,ilom41623',
    action: 'Add',
    event: 'Membership | OnPrem',
    approvalStatus: 'Pending',
    requestorId: 'lomad',
    requestorName: 'ADSUPPORT /IT/ICICILOMBARD/PRBD',
  });

  const text = () => (fixture.nativeElement as HTMLElement).textContent || '';
  const buttons = () => (fixture.nativeElement as HTMLElement).querySelectorAll('.actions .btn.approve, .actions .btn.reject');

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
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue(queryId ? `/approval?id=${queryId}` : '/approval');
    fixture = TestBed.createComponent(Approval);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    sessionStorage.clear();
    queryId = '42';
    approvalService = jasmine.createSpyObj('ApprovalService', ['getRequest', 'approve', 'reject']);
    approvalService.getRequest.and.returnValue(of({ status: 200, message: 'ok', data: pending() }));
    auth = jasmine.createSpyObj('Auth', ['hasFeatureAccess', 'getCurrentUser', 'startLogin']);
    // DL owners do not have Feature.Access: the page must not depend on it.
    auth.hasFeatureAccess.and.returnValue(false);
  });

  afterEach(() => sessionStorage.clear());

  describe('loading the request', () => {
    it('shows details and buttons for a Pending request, without needing Feature.Access', async () => {
      await setup();
      expect(approvalService.getRequest).toHaveBeenCalledWith('42');
      expect(auth.hasFeatureAccess).not.toHaveBeenCalled();
      expect(component.view).toBe('ready');
      expect(text()).toContain('Requested By');
      expect(text()).toContain('ADSUPPORT /IT/ICICILOMBARD/PRBD');
      expect(text()).toContain('(lomad)');
      expect(buttons().length).toBe(2);
    });

    it('clears the saved post-login target once the page is reached', async () => {
      sessionStorage.setItem('postLoginRedirect', '/approval?id=42');
      await setup();
      expect(sessionStorage.getItem('postLoginRedirect')).toBeNull();
    });

    for (const [status, expected] of [
      ['Approved', 'This request has already been approved.'],
      ['Rejected', 'This request has already been rejected.'],
      ['Processing', 'This request is already being processed.'],
    ]) {
      it(`shows info and no buttons when status is ${status}`, async () => {
        approvalService.getRequest.and.returnValue(of({ status: 200, data: { ...pending(), approvalStatus: status } }));
        await setup();
        expect(text()).toContain(expected);
        expect(buttons().length).toBe(0);
      });
    }

    it('403: shows the API "Invalid access" message, no details or buttons', async () => {
      const apiMsg = 'Invalid access. This approval link can only be used by the DL owner it was sent to.';
      approvalService.getRequest.and.returnValue(throwError(() => ({ status: 403, error: { status: 403, message: apiMsg } })));
      await setup();
      expect(component.view).toBe('forbidden');
      expect(text()).toContain('Invalid access');
      expect(text()).toContain(apiMsg);
      expect(text()).not.toContain('Requested By');
      expect(buttons().length).toBe(0);
    });

    it('403 without a body falls back to the standard text', async () => {
      approvalService.getRequest.and.returnValue(throwError(() => ({ status: 403, error: null })));
      await setup();
      expect(component.stateMessage).toBe(MSG_FORBIDDEN);
    });

    it('404: shows "Invalid or expired approval link."', async () => {
      approvalService.getRequest.and.returnValue(throwError(() => ({ status: 404, error: { status: 404, message: 'x' } })));
      await setup();
      expect(component.view).toBe('notFound');
      expect(text()).toContain(MSG_NOT_FOUND);
    });

    it('no id in the link: invalid link, no API call', async () => {
      queryId = null;
      await setup();
      expect(approvalService.getRequest).not.toHaveBeenCalled();
      expect(component.view).toBe('notFound');
    });

    it('401 the first time: starts login and keeps the approval URL', async () => {
      approvalService.getRequest.and.returnValue(throwError(() => ({ status: 401 })));
      await setup();
      expect(auth.startLogin).toHaveBeenCalledWith('/approval?id=42');
      expect(component.view).toBe('loading');
    });

    it('401 again right after login: shows the session message instead of looping', async () => {
      sessionStorage.setItem('approvalLoginAttempt', '/approval?id=42');
      approvalService.getRequest.and.returnValue(throwError(() => ({ status: 401 })));
      await setup();
      expect(auth.startLogin).not.toHaveBeenCalled();
      expect(component.view).toBe('session');
      expect(text()).toContain(MSG_SESSION);
    });

    it('"Sign in again" restarts login and resets the loop guard', async () => {
      sessionStorage.setItem('approvalLoginAttempt', '/approval?id=42');
      approvalService.getRequest.and.returnValue(throwError(() => ({ status: 401 })));
      await setup();
      component.signInAgain();
      expect(sessionStorage.getItem('approvalLoginAttempt')).toBeNull();
      expect(auth.startLogin).toHaveBeenCalledWith('/approval?id=42');
    });

    it('a successful load clears the loop guard', async () => {
      sessionStorage.setItem('approvalLoginAttempt', '/approval?id=42');
      await setup();
      expect(sessionStorage.getItem('approvalLoginAttempt')).toBeNull();
    });
  });

  describe('approve / reject', () => {
    it('200 Approved Successfully: success, buttons hidden, status updated', async () => {
      approvalService.approve.and.returnValue(of('Approved Successfully'));
      await setup();
      component.approve();
      await render();
      expect(approvalService.approve).toHaveBeenCalledWith('42');
      expect(component.alertType).toBe('success');
      expect(component.message).toBe('Approved Successfully');
      expect(component.request.approvalStatus).toBe('Approved');
      expect(buttons().length).toBe(0);
    });

    it('200 Rejected Successfully: success, buttons hidden', async () => {
      approvalService.reject.and.returnValue(of('Rejected Successfully'));
      await setup();
      component.reject();
      await render();
      expect(component.alertType).toBe('success');
      expect(component.request.approvalStatus).toBe('Rejected');
      expect(buttons().length).toBe(0);
    });

    it('500: shows the text and keeps the buttons for a retry', async () => {
      const msg = 'Approval failed: mailbox unavailable. The request is still pending.';
      approvalService.approve.and.returnValue(throwError(() => ({ status: 500, error: msg })));
      await setup();
      component.approve();
      await render();
      expect(component.alertType).toBe('error');
      expect(component.message).toBe(msg);
      expect(buttons().length).toBe(2);
      expect(component.processing).toBeFalse();
    });

    it('409: shows the text, hides the buttons and reloads the request', async () => {
      approvalService.approve.and.returnValue(throwError(() => ({ status: 409, error: 'This request has already been approved.' })));
      await setup();
      approvalService.getRequest.and.returnValue(of({ status: 200, data: { ...pending(), approvalStatus: 'Approved' } }));
      component.approve();
      await render();
      expect(component.message).toBe('This request has already been approved.');
      expect(approvalService.getRequest).toHaveBeenCalledTimes(2);
      expect(component.request.approvalStatus).toBe('Approved');
      expect(buttons().length).toBe(0);
    });

    it('409 while still Pending on reload (processing race): buttons stay hidden', async () => {
      approvalService.approve.and.returnValue(throwError(() => ({ status: 409, error: 'This request is being processed.' })));
      await setup();
      component.approve();
      await render();
      expect(buttons().length).toBe(0);
    });

    it('403: switches to the invalid-access state with the API text', async () => {
      approvalService.reject.and.returnValue(throwError(() => ({ status: 403, error: 'Invalid access. Not your link.' })));
      await setup();
      component.reject();
      await render();
      expect(component.view).toBe('forbidden');
      expect(component.stateMessage).toBe('Invalid access. Not your link.');
      expect(buttons().length).toBe(0);
    });

    it('404: switches to the invalid-link state', async () => {
      approvalService.approve.and.returnValue(throwError(() => ({ status: 404, error: 'Invalid or expired approval link.' })));
      await setup();
      component.approve();
      await render();
      expect(component.view).toBe('notFound');
      expect(buttons().length).toBe(0);
    });

    it('401 on POST: session message, no redirect loop', async () => {
      approvalService.approve.and.returnValue(throwError(() => ({ status: 401 })));
      await setup();
      component.approve();
      await render();
      expect(component.view).toBe('session');
      expect(auth.startLogin).not.toHaveBeenCalled();
    });

    it('ignores clicks while a decision is in flight', async () => {
      await setup();
      component.processing = true;
      component.approve();
      expect(approvalService.approve).not.toHaveBeenCalled();
    });

    it('does not call the API when the request is not Pending', async () => {
      approvalService.getRequest.and.returnValue(of({ status: 200, data: { ...pending(), approvalStatus: 'Approved' } }));
      await setup();
      component.approve();
      expect(approvalService.approve).not.toHaveBeenCalled();
    });
  });
});
