import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Alert } from '../../Shared/alert/alert/alert';
import { ApprovalService } from '../../services/approval';
import { Loader } from "../SharedComps/loader/loader";
import { FormsModule } from "@angular/forms";


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

  constructor(
    private route: ActivatedRoute,
    private approvalService: ApprovalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');

    this.approvalService.getRequest(this.id).subscribe({
      next: (res: any) => {
        if (res.status === 404) {
          this.alertType = 'error';
          this.ERRmessage = 'The request might be completed.';
          this.request = null;
        } else if (res.status === 200) {
          this.request = res.data;
          console.log(this.request);
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

      error: () => {
        this.alertType = 'error';
        this.ERRmessage = 'Internal Server Error';
        this.cdr.detectChanges();
      }
    });
  }

  approve() {
    this.approvalService.approve(this.id).subscribe((res) => {
      this.message = res;
      this.actions = false;
      this.alertType = res === 'Approved Successfully' ? 'success' : 'error';
      this.cdr.detectChanges();
    });
  }

  reject() {
    this.approvalService.reject(this.id).subscribe((res) => {
      this.message = res;
      this.actions = false;
      this.alertType = res === 'Rejected Successfully' ? 'success' : 'error';
      this.cdr.detectChanges();
    });
  }
}
