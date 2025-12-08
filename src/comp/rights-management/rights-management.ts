import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RightsManagementService } from '../../services/rights-management';
import { AddOrRemoveRightsDTO } from '../../Interfaces/add-or-remove-rights-dto';
import { Alert } from '../../Shared/alert/alert/alert';
import { ValidationService } from '../../services/validation-service';

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
  showform: boolean = false;

  rightsInput: string = '';

  constructor(
    private rightsService: RightsManagementService,
    private validator: ValidationService,
    private cd: ChangeDetectorRef
  ) {}

  getRights(): void {
    this.rightsService.getByDLName(this.dlName).subscribe({
      next: (res) => {
        this.rights = res;
        this.showform = true;
        this.cd.detectChanges(); 
      },
      error: () => {
        this.message = 'Failed to fetch rights.';
        this.alertType = 'error';
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
    };

    this.rightsService.addOrRemoveRights(dto).subscribe({
      next: (res) => {
        this.showform = false;
        this.message = res.message || 'Operation successful.';
        this.alertType = 'success';
        this.cd.detectChanges();
      },
      error: () => {
        this.message = 'Operation failed.';
        this.alertType = 'error';
        this.cd.detectChanges();   
      },
    });
  }
}
