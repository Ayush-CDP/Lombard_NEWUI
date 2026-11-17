import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { GroupMembershipService } from '../../services/group-membership';
import { AddOrRemoveDLMembershipDTO } from '../../Interfaces/add-or-remove-dlmembership-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../Shared/alert/alert/alert';
import { ValidationService } from '../../services/validation-service';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';
import { getFeatureErrorMessage } from '../../Shared/http-error';
import { extractDlDetails, NO_OWNER_TEXT } from '../../Shared/dl-details';

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
  /** Get Details in flight: the button is disabled, so no duplicate calls (API rate limit). */
  loading = false;
  readonly noOwnerText = NO_OWNER_TEXT;

  constructor(
    private groupService: GroupMembershipService,
    private validator: ValidationService,
    private cd: ChangeDetectorRef,
    private auth: Auth
  ) {}

  getMembers(): void {
    if (this.loading) {
      return;
    }
    const validation = this.validator.validateDLName(this.dlName);
    if (!validation.isValid) {
      this.message = validation.errors.join(' | ');
      this.alertType = 'error';
      this.members = null;
      this.showform = false;
      return;
    }

    const requestedSource = this.source;
    const check = this.validator.validateSource(requestedSource);
    if (!check.isValid) {
      this.message = check.errors.join(' | ');
      this.alertType = 'error';
      return;
    }

    this.loading = true;
    this.groupService
      .getByDLName(this.dlName.trim(), requestedSource)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          const details = extractDlDetails(res);
          if (res?.success === false || !details) {
            this.members = null;
            this.showform = false;
            this.message = res?.message || 'No details found for this DL. Please check the DL name and source.';
            this.alertType = 'error';
            this.cd.detectChanges();
            return;
          }
          this.members = details;
          this.usedSource = requestedSource; // source the details were fetched from
          this.showform = true;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.members = null;
          this.message = getFeatureErrorMessage(err, 'Failed to fetch members.');
          this.alertType = 'error';
          this.showform = false;
          this.cd.detectChanges();
        },
      });
  }

  modifyMembership(): void {
    if (this.submitting) {
      return;
    }

    const idCheck = this.validator.validateIdList(this.empIDs, 'Employee / Consultant ID');
    const fieldCheck = this.validator.validateSourceAndAction(this.usedSource, this.action);
    const errors = [...idCheck.errors, ...fieldCheck.errors];
    if (errors.length) {
      this.message = errors.join(' | ');
      this.alertType = 'error';
      this.cd.detectChanges();
      return;
    }

    const empIds = String(this.empIDs)
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .join(',');

    // The API takes the requestor from the token and ignores these;
    // they are still sent for compatibility. No UI logic depends on them.
    const user = this.auth.getCurrentUser();

    const dto: AddOrRemoveDLMembershipDTO = {
      dlName: this.members?.dlName,
      dlOwner: this.members?.dlOwner,
      action: this.action,
      empIds,
      // Submit against the source the DL details were actually fetched from.
      source: this.usedSource,
      sendMailAccess: null,
      groupOwnershipChange: null,
      requestorId: user?.id,
      requestorName: user?.name,
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
            // API: "This request has been sent to the DL owner for approval via email."
            // The fallback only guards against an empty alert if the API omits the message.
            this.message = res?.message || 'Request submitted.';
            this.alertType = 'success';
            this.resetForm();
          }
          this.cd.detectChanges();
        },
        error: (err) => {
          // Keep the form open so the user can correct the input and retry.
          this.submitting = false;
          this.message = getFeatureErrorMessage(err, 'Operation failed.');
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