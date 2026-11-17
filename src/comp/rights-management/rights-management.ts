import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RightsManagementService } from '../../services/rights-management';
import { AddOrRemoveRightsDTO } from '../../Interfaces/add-or-remove-rights-dto';
import { Alert } from '../../Shared/alert/alert/alert';
import { ValidationService } from '../../services/validation-service';
import { Auth } from '../../services/auth';
import { getFeatureErrorMessage } from '../../Shared/http-error';
import { extractDlDetails, NO_OWNER_TEXT } from '../../Shared/dl-details';

@Component({
  selector: 'app-rights-management',
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './rights-management.html',
  styleUrl: './rights-management.css',
})
export class RightsManagementComponent {
  dlName = '';
  userEmail = '';
  action: 'Add' | 'Remove' = 'Add';
  operationType: 'SendEmailAccess' | 'GroupOwnershipChange' = 'SendEmailAccess';
  /** Group Ownership Change is not working yet: the option is shown disabled. Set to true to re-enable. */
  readonly groupOwnershipChangeEnabled = false;
  message = '';
  rights: any;
  alertType: 'success' | 'error' | 'info' = 'info';
  showform = false;
  source: 'OnPrem' | 'Cloud' = 'OnPrem';
  usedSource: 'OnPrem' | 'Cloud' = 'OnPrem';
  rightsInput: string = '';
  submitting = false;
  /** View Rights in flight: the button is disabled, so no duplicate calls (API rate limit). */
  loading = false;
  readonly noOwnerText = NO_OWNER_TEXT;

  constructor(
    private rightsService: RightsManagementService,
    private validator: ValidationService,
    private cd: ChangeDetectorRef,
    private auth: Auth
  ) {}

  private _subs: any[] = [];

  ngOnDestroy(): void {
    this._subs.forEach(s => s?.unsubscribe && s.unsubscribe());
  }

  getRights(): void {
    if (this.loading) {
      return;
    }
    const validation = this.validator.validateDLName(this.dlName);

    if (!validation.isValid) {
      this.message = validation.errors.join(' | ');
      this.alertType = 'error';
      this.showform = false;
      return;
    }
    const requestedSource = this.source;
    const sourceCheck = this.validator.validateSource(requestedSource);
    if (!sourceCheck.isValid) {
      this.showError(sourceCheck.errors.join(' | '));
      return;
    }

    this.loading = true;
    const sub = this.rightsService.getByDLName(this.dlName.trim(), requestedSource).subscribe({
      next: (res) => {
        this.loading = false;
        // RightsManagement returns the DL object without a { data } envelope.
        const details = extractDlDetails(res);
        if (!details) {
          this.rights = null;
          this.showform = false;
          this.showError(res?.message || 'No details found for this DL. Please check the DL name and source.');
          return;
        }
        this.rights = details;
        this.usedSource = requestedSource;
        this.showform = true;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.alertType = 'error';
        this.message = getFeatureErrorMessage(err, 'Failed to fetch rights.');
        this.showform = false;
        this.cd.detectChanges();
      },
    });
    this._subs.push(sub);
  }

  modifyRights(): void {
    if (this.submitting) {
      return;
    }

    if (this.operationType === 'GroupOwnershipChange' && !this.groupOwnershipChangeEnabled) {
      this.showError('Group Ownership Change is not available yet. Please use Send Email Access.');
      return;
    }

    const idCheck = this.validator.validateIdList(this.rightsInput, 'ID');
    const fieldCheck = this.validator.validateSourceAndAction(this.usedSource, this.action);
    const errors = [...idCheck.errors, ...fieldCheck.errors];
    if (errors.length) {
      this.showError(errors.join(' | '));
      return;
    }

    // The API takes the requestor from the token and ignores these;
    // they are still sent for compatibility. No UI logic depends on them.
    const user = this.auth.getCurrentUser();

    const rights = String(this.rightsInput)
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .join(',');

    const dto: AddOrRemoveRightsDTO = {
      dlName: this.rights?.dlName || this.dlName,
      dlOwner: this.rights?.dlOwner || this.userEmail,
      action: this.action,
      rights,
      source: this.usedSource,
      requestorId: user?.id,
      requestorName: user?.name,
    };

    const permission = this.action === 'Add' ? 'Allow' : 'Deny';
    if (this.operationType === 'SendEmailAccess') {
      dto.sendMailAccess = permission;
    } else {
      dto.groupOwnershipChange = permission;
    }

    this.submitting = true;
    const sub2 = this.rightsService.addOrRemoveRights(dto).subscribe({
      next: (res) => {
        this.submitting = false;
        // API: "This request has been sent to the DL owner for approval via email."
        // The fallback only guards against an empty alert if the API omits the message.
        this.message = res?.message || 'Request submitted.';
        this.alertType = 'success';
        this.resetForm();
        this.cd.detectChanges();
      },
      error: (err) => {
        // Keep the form open so the user can correct the input and retry.
        this.submitting = false;
        this.showError(getFeatureErrorMessage(err, 'Operation failed.'));
      },
    });
    this._subs.push(sub2);
  }

  private showError(msg: string): void {
    this.message = msg;
    this.alertType = 'error';
    this.cd.detectChanges();
  }

  resetForm(): void {
    this.dlName = '';
    this.rightsInput = '';
    this.userEmail = '';
    this.action = 'Add';
    this.rights = null;
    this.showform = false;
    this.usedSource = 'OnPrem';
    this.operationType = 'SendEmailAccess';
  }
}