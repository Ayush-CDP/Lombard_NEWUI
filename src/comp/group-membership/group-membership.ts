import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { GroupMembershipService } from '../../services/group-membership';
import { AddOrRemoveDLMembershipDTO } from '../../Interfaces/add-or-remove-dlmembership-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../Shared/alert/alert/alert';
import { ValidationService } from '../../services/validation-service';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';
import { getApiErrorMessage } from '../../Shared/http-error';

@Component({
  selector: 'app-group-membership',
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './group-membership.html',
  styleUrl: './group-membership.css',
})
export class GroupMembershipComponent implements OnDestroy {
  dlName = '';
  owner = '';
  userEmail = '';
  action: 'Add' | 'Remove' = 'Add';
  message = '';
  members: any;
  empIDs: any;
  alertType: 'success' | 'error' | 'info' = 'info';
  showform = false;
  source: 'OnPrem' | 'Cloud' = 'OnPrem';
  usedSource: 'OnPrem' | 'Cloud' = 'OnPrem'; // Track the source used to fetch data

  private destroy$ = new Subject<void>();

  submitting = false;

  constructor(
    private groupService: GroupMembershipService,
    private validator: ValidationService,
    private cd: ChangeDetectorRef,
    private auth: Auth
  ) {}

  getMembers(): void {
    const validation = this.validator.validateDLName(this.dlName);
    if (!validation.isValid) {
      this.message = validation.errors.join(' | ');
      this.alertType = 'error';
      this.members = null;
      this.showform = false;
      return;
    }

this.groupService.getByDLName(this.dlName, this.source).subscribe({
      next: (res) => {
        this.members = res.data; // CORRECT
        this.usedSource = this.source; // Store the source that was used to fetch data
        this.showform = true;
        this.cd.detectChanges(); // ⭐ FORCE UI UPDATE
      },
      error: (err) => {
        this.message = getApiErrorMessage(err, 'Failed to fetch members.');
        this.alertType = 'error';
        this.showform = false;
      },
    });
  }

  modifyMembership(): void {
    if (this.submitting) {
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      this.message = 'Unable to identify the logged-in user. Please sign in again.';
      this.alertType = 'error';
      this.cd.detectChanges();
      return;
    }

    const empIds = String(this.empIDs ?? '').trim();
    if (!empIds) {
      this.message = 'Please enter at least one Employee / Consultant ID.';
      this.alertType = 'error';
      this.cd.detectChanges();
      return;
    }

    const dto: AddOrRemoveDLMembershipDTO = {
      dlName: this.members?.dlName,
      dlOwner: this.members?.dlOwner,
      action: this.action,
      empIds,
      // Submit against the source the DL details were actually fetched from.
      source: this.usedSource,
      sendMailAccess: null,
      groupOwnershipChange: null,
      requestorId: user.id,
      requestorName: user.name,
    };

    this.submitting = true;
    this.groupService
      .addOrRemoveDLMembership(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.submitting = false;
          if (res?.success === false) {
            this.message = res?.message || 'Operation failed.';
            this.alertType = 'error';
          } else {
            this.message = res?.message || (typeof res?.data === 'string' ? res.data : '') || 'Operation successful.';
            this.alertType = 'success';
            this.resetForm();
          }
          this.cd.detectChanges();
        },
        error: (err) => {
          // Keep the form open so the user can correct the input and retry.
          this.submitting = false;
          this.message = getApiErrorMessage(err, 'Operation failed.');
          this.alertType = 'error';
          this.cd.detectChanges();
        },
      });
  }

  resetForm(): void {
    this.dlName = '';
    this.empIDs = '';
    this.action = 'Add';
    this.members = null;
    this.showform = false;
    this.usedSource = 'OnPrem';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}