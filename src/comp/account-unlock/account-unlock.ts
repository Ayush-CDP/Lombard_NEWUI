import { ChangeDetectorRef, Component } from '@angular/core';
import { AccountUnlockService } from '../../services/account-unlock';
import { AccountUnlockRequestDTO } from '../../Interfaces/account-unlock-request-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../Shared/alert/alert/alert';

@Component({
  selector: 'app-account-unlock',
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './account-unlock.html',
  styleUrl: './account-unlock.css',
})
export class AccountUnlockComponent {
  employeeId = '';
  unlock = false;
  message = '';
  user: any;
  alertType: 'success' | 'error' | 'info' = 'info';
  loading = false;
  showunlockbtn = false;

  constructor(private accountUnlockService: AccountUnlockService, private cd: ChangeDetectorRef) {}

  getUserDetails(): void {
    if (!this.employeeId.trim()) return;

    this.loading = true;
    this.message = '';
    this.showunlockbtn = false;
    this.cd.detectChanges();

    this.accountUnlockService.getUserDetails(this.employeeId).subscribe({
      next: (res) => {
        if (!res.success) {
          this.message = res.message || 'User not found.';
          this.alertType = 'error';
          return;
        }

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

  this.accountUnlockService.unlockAccount(request).subscribe({
    next: (res) => {
      if (res.success) {
        this.message = 'Account unlock request sent successfully.';
        this.alertType = 'success';
      } else {
        this.message = res.message || 'Unlock failed.';
        this.alertType = 'error';
      }

      this.user = null;
      this.showunlockbtn = false;
      this.loading = false;
      this.cd.detectChanges();
    },
    error: () => {
      this.message = 'Unlock failed.';
      this.alertType = 'error';
      this.loading = false;
      this.cd.detectChanges();
    }
  });
}

}
