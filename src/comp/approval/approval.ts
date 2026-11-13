import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Alert } from '../../Shared/alert/alert/alert';
import { ApprovalService } from '../../services/approval';
import { Loader } from "../SharedComps/loader/loader";
import { FormsModule } from "@angular/forms";
import { getApiErrorMessage } from '../../Shared/http-error';


@Component({
  selector: 'app-approval',
  imports: [CommonModule, Alert, Loader, FormsModule],
  templateUrl: './approval.html',
  styleUrl: './approval.css',
})
export class Approval {
  id: any;
  request: any;
  decisionMsg = '';
  message: string = '';
  alertType: "error" | "success" | "info" = "info";
  ERRmessage: string = '';
  approvalHeader : string ='';
  empIds : boolean = false;
  rights  : boolean = false;
  lock : boolean = false;
  actions : boolean = true;
  processing = false;

  constructor(
    private route: ActivatedRoute,
    private approvalService: ApprovalService,
    private cdr: ChangeDetectorRef,
    private auth: Auth,
    private router: Router
  ) {}

  private _subs: any[] = [];

  ngOnDestroy(): void {
    this._subs.forEach(s => s?.unsubscribe && s.unsubscribe());
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');

    if (!this.id) {
      this.alertType = 'error';
      this.ERRmessage = 'Invalid approval link.';
      this.actions = false;
      this.cdr.detectChanges();
      return;
    }

    // ensure user has approval permissions
    if (!this.auth.hasFeatureAccess()) {
      this.alertType = 'error';
      this.ERRmessage = 'Access denied.';
      this.actions = false;
      this.cdr.detectChanges();
      return;
    }

    const sub = this.approvalService.getRequest(this.id).subscribe({
      next: (res: any) => {
        if (res.status === 404) {
          this.alertType = 'error';
          this.ERRmessage = 'The request might be completed.';
          this.request = null;
        } else if (res.status === 200) {
          this.request = res.data;
          if(this.request.event == 'Rights | OnPrem' || this.request.event == 'Rights | Cloud'){
              this.approvalHeader = 'DL Rights Request';
              this.rights = true;
          }else if(this.request.event == 'Membership | OnPrem' || this.request.event == 'Membership | Cloud' ){
            this.approvalHeader = 'DL Membership Request';
            this.empIds = true;
          }else{
             this.approvalHeader = 'Account Lock/Unlock Request';
             this.lock = true;
          }
        }
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.alertType = 'error';
        this.ERRmessage = getApiErrorMessage(err, 'Internal Server Error');
        this.cdr.detectChanges();
      }
    });
    this._subs.push(sub);
  }

  approve() {
    this.submitDecision('approve');
  }

  reject() {
    this.submitDecision('reject');
  }

  private submitDecision(decision: 'approve' | 'reject'): void {
    if (this.processing || !this.id) {
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
          this.message = text;
          this.alertType = 'success';
          this.actions = false;
          if (this.request) {
            this.request.approvalStatus = decision === 'approve' ? 'Approved' : 'Rejected';
          }
        } else {
          // e.g. "500 Server Error" returned as text
          this.message = text || fallback;
          this.alertType = 'error';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.processing = false;
        this.message = getApiErrorMessage(err, fallback);
        this.alertType = 'error';
        this.cdr.detectChanges();
      }
    });
    this._subs.push(sub);
  }
}