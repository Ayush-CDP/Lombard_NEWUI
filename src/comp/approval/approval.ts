import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth';
import { Alert } from '../../Shared/alert/alert/alert';
import { ApprovalService } from '../../services/approval';
import { Loader } from '../SharedComps/loader/loader';
import { getApiErrorMessage } from '../../Shared/http-error';
import { clearPostLoginRedirect } from '../../Shared/post-login-redirect';

/** What the page is showing. Authorisation is enforced by the API. */
export type ApprovalView = 'loading' | 'ready' | 'forbidden' | 'notFound' | 'session' | 'error';

/** Remembers that we already sent this approval URL through login once (loop guard). */
const LOGIN_ATTEMPT_KEY = 'approvalLoginAttempt';

export const MSG_FORBIDDEN =
  'Invalid access. This approval link can only be used by the DL owner it was sent to.';
export const MSG_NOT_FOUND = 'Invalid or expired approval link.';
export const MSG_SESSION = 'Your session could not be verified. Please sign in again.';

@Component({
  selector: 'app-approval',
  imports: [CommonModule, Alert, Loader],
  templateUrl: './approval.html',
  styleUrl: './approval.css',
})
export class Approval implements OnInit, OnDestroy {
  id: string | null = null;
  request: any = null;
  view: ApprovalView = 'loading';
  /** Text for the forbidden / notFound / session / error states. */
  stateMessage = '';

  /** Result of an approve / reject click. */
  message = '';
  alertType: 'error' | 'success' | 'info' = 'info';

  approvalHeader = '';
  empIds = false;
  rights = false;
  lock = false;

  processing = false;
  /** Set once a decision was made (or refused with 403/404/409): no more buttons. */
  decided = false;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private approvalService: ApprovalService,
    private cdr: ChangeDetectorRef,
    private auth: Auth
  ) {}

  /** Approve / Reject are only offered while the request is still pending. */
  get canDecide(): boolean {
    return this.view === 'ready' && !this.decided && this.request?.approvalStatus === 'Pending';
  }

  /** Info line for requests that are no longer pending. */
  get statusInfo(): string {
    if (this.view !== 'ready' || this.decided || !this.request) {
      return '';
    }
    const status = String(this.request.approvalStatus ?? '').trim();
    if (!status || status === 'Pending') {
      return '';
    }
    if (status.toLowerCase() === 'processing') {
      return 'This request is already being processed.';
    }
    return `This request has already been ${status.toLowerCase()}.`;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    // We are on the approval page now, so the saved login target is no longer needed.
    clearPostLoginRedirect();

    if (!this.id) {
      this.setState('notFound', MSG_NOT_FOUND);
      return;
    }
    this.loadRequest();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadRequest(): void {
    if (!this.id) {
      return;
    }
    const sub = this.approvalService.getRequest(this.id).subscribe({
      next: (res: any) => {
        this.clearLoginAttempt();
        // Older API versions answered 200 with { status: 404 } in the body.
        if (res?.status === 404 || !res?.data) {
          this.setState('notFound', MSG_NOT_FOUND);
          return;
        }
        if (res?.status === 403) {
          this.setState('forbidden', res?.message || MSG_FORBIDDEN);
          return;
        }
        this.showRequest(res.data);
      },
      error: (err) => {
        switch (err?.status) {
          case 401:
            this.handleUnauthorized();
            return;
          case 403:
            this.clearLoginAttempt();
            this.setState('forbidden', getApiErrorMessage(err, MSG_FORBIDDEN));
            return;
          case 404:
            this.clearLoginAttempt();
            this.setState('notFound', MSG_NOT_FOUND);
            return;
          default:
            this.setState('error', getApiErrorMessage(err, 'Unable to load the request. Please try again later.'));
        }
      },
    });
    this.subs.push(sub);
  }

  approve(): void {
    this.submitDecision('approve');
  }

  reject(): void {
    this.submitDecision('reject');
  }

  /** "Sign in again" button on the session state. */
  signInAgain(): void {
    this.clearLoginAttempt();
    this.auth.startLogin(this.router.url);
  }

  private submitDecision(decision: 'approve' | 'reject'): void {
    if (this.processing || !this.id || !this.canDecide) {
      return;
    }
    this.processing = true;

    const call$ = decision === 'approve'
      ? this.approvalService.approve(this.id)
      : this.approvalService.reject(this.id);
    const expected = decision === 'approve' ? 'Approved Successfully' : 'Rejected Successfully';
    const fallback = decision === 'approve' ? 'Approval failed.' : 'Rejection failed.';

    const sub = call$.subscribe({
      next: (res) => {
        this.processing = false;
        const text = String(res ?? '').trim();
        if (text === expected) {
          this.decided = true;
          this.request.approvalStatus = decision === 'approve' ? 'Approved' : 'Rejected';
          this.showMessage(text, 'success');
        } else {
          // Unexpected 200 body (e.g. older API "500 Server Error"): allow retry.
          this.showMessage(text || fallback, 'error');
        }
      },
      error: (err) => {
        this.processing = false;
        const status = err?.status;

        if (status === 401) {
          this.setState('session', MSG_SESSION);
          return;
        }

        // Invalid access / invalid link: switch to that state with the API text (no buttons).
        if (status === 403) {
          this.setState('forbidden', getApiErrorMessage(err, MSG_FORBIDDEN));
          return;
        }
        if (status === 404) {
          this.setState('notFound', getApiErrorMessage(err, MSG_NOT_FOUND));
          return;
        }
        // Already approved / rejected / processing: show the text, hide the
        // buttons and reload so the Status row is current.
        if (status === 409) {
          this.decided = true;
          this.showMessage(getApiErrorMessage(err, 'This request has already been processed.'), 'info');
          this.loadRequest();
          return;
        }

        // 500 / network: keep the buttons so the owner can retry.
        this.showMessage(getApiErrorMessage(err, fallback), 'error');
      },
    });
    this.subs.push(sub);
  }

  private showRequest(data: any): void {
    this.request = data;
    this.empIds = this.rights = this.lock = false;

    const event = String(data?.event ?? '');
    if (event === 'Rights | OnPrem' || event === 'Rights | Cloud') {
      this.approvalHeader = 'DL Rights Request';
      this.rights = true;
    } else if (event === 'Membership | OnPrem' || event === 'Membership | Cloud') {
      this.approvalHeader = 'DL Membership Request';
      this.empIds = true;
    } else {
      this.approvalHeader = 'Account Lock/Unlock Request';
      this.lock = true;
    }
    this.view = 'ready';
    this.stateMessage = '';
    this.cdr.detectChanges();
  }

  /**
   * 401 on load: send the user through login once, keeping the approval URL.
   * If we already did that for this URL and still get 401, stop and ask the
   * user to sign in again instead of looping.
   */
  private handleUnauthorized(): void {
    const url = this.router.url;
    if (this.readLoginAttempt() === url) {
      this.setState('session', MSG_SESSION);
      return;
    }
    this.writeLoginAttempt(url);
    this.view = 'loading';
    this.cdr.detectChanges();
    this.auth.startLogin(url);
  }

  private setState(view: ApprovalView, msg: string): void {
    this.view = view;
    this.stateMessage = msg;
    if (view !== 'ready') {
      this.request = null;
    }
    this.cdr.detectChanges();
  }

  private showMessage(msg: string, type: 'error' | 'success' | 'info'): void {
    this.message = msg;
    this.alertType = type;
    this.cdr.detectChanges();
  }

  private readLoginAttempt(): string | null {
    try {
      return sessionStorage.getItem(LOGIN_ATTEMPT_KEY);
    } catch {
      return null;
    }
  }

  private writeLoginAttempt(url: string): void {
    try {
      sessionStorage.setItem(LOGIN_ATTEMPT_KEY, url);
    } catch {
      // ignore
    }
  }

  private clearLoginAttempt(): void {
    try {
      sessionStorage.removeItem(LOGIN_ATTEMPT_KEY);
    } catch {
      // ignore
    }
  }
}
