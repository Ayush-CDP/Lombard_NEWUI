import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RightsManagementService } from '../../services/rights-management';
import { AddOrRemoveRightsDTO } from '../../Interfaces/add-or-remove-rights-dto';
import { Alert } from '../../Shared/alert/alert/alert';
import { ValidationService } from '../../services/validation-service';
import { GroupMembershipService } from '../../services/group-membership';

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
  message = '';
  rights: any;
  alertType: 'success' | 'error' | 'info' = 'info';
  showform = false;
  source: 'OnPrem' | 'Cloud' = 'OnPrem';
  rightsInput: string = '';

  constructor(
    private rightsService: RightsManagementService,
    private validator: ValidationService,
    private cd: ChangeDetectorRef,
    private groupService: GroupMembershipService
  ) {}

  getRights(): void {
    const validation = this.validator.validateDLName(this.dlName);

    if (!validation.isValid) {
      this.message = validation.errors.join(' | ');
      this.alertType = 'error';
      this.showform = false;
      return;
    }
    this.groupService.getByDLName(this.dlName, this.source).subscribe({
      next: (res) => {
        this.rights = res.data;
        this.showform = true;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Rights fetch failed:', err);
        this.alertType = 'error';
        this.message = 'Failed to fetch rights.';
        this.showform = false;
        this.cd.detectChanges();
      },
    });
  }

  modifyRights(): void {
    const dto: AddOrRemoveRightsDTO = {
      DLName: this.dlName,
      DLOwner: this.userEmail,
      Action: this.action,
      Rights: this.rightsInput,
      Source: this.source,
    };

    this.rightsService.addOrRemoveRights(dto).subscribe({
      next: (res) => {
        this.showform = false;
        this.message = res.message || 'Operation successful.';
        this.alertType = 'success';
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Rights update failed:', err);
        this.message = 'Operation failed.';
        this.alertType = 'error';
        this.cd.detectChanges();
      },
    });
  }
}
