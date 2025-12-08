
import { ChangeDetectorRef, Component } from '@angular/core';
import { AccountUnlockService } from '../../services/account-unlock';
import { AccountUnlockRequestDTO } from '../../Interfaces/account-unlock-request-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from "../../Shared/alert/alert/alert";

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

  constructor(private accountUnlockService: AccountUnlockService,  private cd: ChangeDetectorRef) {}

 getUserDetails(): void {
  if (!this.employeeId.trim()) return;

  this.loading = true;
  this.cd.detectChanges(); // force initial state

  this.accountUnlockService.getUserDetails(this.employeeId).subscribe({
    next: (response) => {
      this.user = response.userDetails;
      this.message = response.message;
      this.loading = false;
      this.alertType = 'success';
      this.showunlockbtn = true;
      this.cd.detectChanges(); // prevent ExpressionChanged error
    },
    error: (err) => {
      this.message = err.error?.message || 'Error fetching user.';
      this.user = '';
      this.loading = false;
      this.alertType = 'error';
      this.showunlockbtn = false;
      this.cd.detectChanges(); // critical fix
    }
  });
}


  unlockAccount(): void {
    if (!this.employeeId.trim()) return;

    const request: AccountUnlockRequestDTO = {
      EmployeeId: this.employeeId,
      Unlock: this.unlock
    };

    this.accountUnlockService.unlockAccount(request).subscribe({
      next: (response) => this.message = response.message || 'Account unlocked successfully.',
      error: (err) => this.message = err.error?.message || 'Unlock failed.'
    });
  }
}

