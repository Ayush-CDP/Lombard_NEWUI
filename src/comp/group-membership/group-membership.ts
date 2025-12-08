import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { GroupMembershipService } from '../../services/group-membership';
import { AddOrRemoveDLMembershipDTO } from '../../Interfaces/add-or-remove-dlmembership-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../Shared/alert/alert/alert';
import { ValidationService } from '../../services/validation-service';
import { Subject, takeUntil } from 'rxjs';

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

  private destroy$ = new Subject<void>();

  constructor(
    private groupService: GroupMembershipService,
    private validator: ValidationService,
    private cd: ChangeDetectorRef
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

  this.groupService.getByDLName(this.dlName).subscribe({
    next: (res) => {

      this.members = res.data;   // CORRECT
      this.showform = true;

      this.cd.detectChanges();   // ⭐ FORCE UI UPDATE

    },
    error: () => {
      this.message = 'Failed to fetch members.';
      this.alertType = 'error';
      this.showform = false;
    },
  });
}


  modifyMembership(): void {
    const dto: AddOrRemoveDLMembershipDTO = {
      DLName: this.dlName,
      DLOwner: this.owner,
      Action: this.action,
      EmpIds: this.empIDs.trim(),
     // ApproverEmail: this.userEmail,
    };

    this.groupService
      .addOrRemoveDLMembership(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.message = res.data || 'Operation successful.';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
