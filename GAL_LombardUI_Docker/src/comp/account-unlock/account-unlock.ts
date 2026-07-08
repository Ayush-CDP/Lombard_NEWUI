import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { AccountUnlockService } from '../../services/account-unlock';
import { AccountUnlockRequestDTO } from '../../Interfaces/account-unlock-request-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../Shared/alert/alert/alert';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-account-unlock',
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './account-unlock.html',
  styleUrl: './account-unlock.css',
})
export class AccountUnlockComponent implements OnInit {
  employeeId = '';
  unlock = false;
  message = '';
  user: any;
  alertType: 'success' | 'error' | 'info' = 'info';
  loading = false;
  showunlockbtn = false;
  hasAccess = false;

  constructor(
    private accountUnlockService: AccountUnlockService,
    private cd: ChangeDetectorRef,
    private auth: Auth
  ) {}

  private _subs: any[] = [];

  ngOnDestroy(): void {
    this._subs.forEach(s => s?.unsubscribe && s.unsubscribe());
  }

  ngOnInit(): void {
    this.hasAccess = this.auth.hasFeatureAccess();
  }

  getUserDetails(): void {
    if (!this.employeeId.trim()) return;

    this.loading = true;
    this.message = '';
    this.showunlockbtn = false;
    this.cd.detectChanges();

    const sub = this.accountUnlockService.getUserDetails(this.employeeId).subscribe({
      next: (res) => {
        if (!res.success) {
          this.message = res.message || 'User not found.';
          this.alertType = 'error';
          this.loading = false;
          this.cd.detectChanges();
          return;
        }
        console.log(res.data);
        this.user = res.data;
        this.alertType = 'success';

        // show unlock only if actually locked
        this.showunlockbtn = this.user.isLocked === true;

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.message = err.error?.message || 'Error fetching user.';
        this.user = null;
        this.alertType = 'error';
        this.loading = false;
        this.showunlockbtn = false;
        this.cd.detectChanges();
      },
    });
    this._subs.push(sub);
  }

 unlockAccount(): void {
  const request: AccountUnlockRequestDTO = {
    EmployeeId: this.employeeId,
    DLName: '',
    DLOwner: '',
    Unlock: true
  };

  this.loading = true;
  this.cd.detectChanges();

  const sub2 = this.accountUnlockService.unlockAccount(request).subscribe({
    next: (res) => {
      if (res.success) {
        this.message = 'Account unlock request sent successfully.';
        this.alertType = 'success';
      } else {
        this.message = res.message || 'Unlock failed.';
        this.alertType = 'error';
      }

      this.resetForm();
      this.cd.detectChanges();
    },
    error: (err) => {
      this.message = err?.error?.message || 'Unlock failed.';
      this.alertType = 'error';
      this.loading = false;
      this.cd.detectChanges();
    }
  });
  this._subs.push(sub2);
}

resetForm(): void {
  this.employeeId = '';
  this.user = null;
  this.unlock = false;
  this.showunlockbtn = false;
  this.loading = false;
}

}

//Azure AD
//    ├── App Roles (Feature.Access)
//    ├── Security Group (optional)
//    └── Group → Role mapping
 
// User
//    ↓
// Login
//    ↓
// Token contains roles
//    ↓
// App checks role
//    ↓
// Feature enabled

//{
//   "aud": "your-app-client-id",
//   "roles": ["Feature.Access"],
//   "name": "John Doe",
//   "upn": "john@domain.com"
// }
