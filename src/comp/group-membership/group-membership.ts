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
  source: 'OnPrem' | 'Cloud' = 'OnPrem';

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

this.groupService.getByDLName(this.dlName, this.source).subscribe({
      next: (res) => {
        this.members = res.data; // CORRECT
        this.showform = true;
        this.cd.detectChanges(); // ⭐ FORCE UI UPDATE
      },
      error: (err) => {
        console.error('GetMembers failed', err);
        this.message = err?.error?.message || 'Failed to fetch members.';
        this.alertType = 'error';
        this.showform = false;
      },
    });
  }

  modifyMembership(): void {
    this.showform = false;
    const dto: AddOrRemoveDLMembershipDTO = {
      DLName: this.members?.dlName,
      DLOwner: this.members?.dlOwner,
      Action: this.action,
      EmpIds: this.empIDs.trim(),
      Source: this.source,
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
        error: (err) => {
          console.error('ModifyMembership failed', err);
          this.message = err?.error?.message || 'Operation failed.';
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
