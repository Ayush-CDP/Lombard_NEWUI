import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GroupMembershipComponent } from './group-membership';
import { GroupMembershipService } from '../../services/group-membership';
import { Auth } from '../../services/auth';

describe('GroupMembershipComponent submit', () => {
  let component: GroupMembershipComponent;
  let groupService: jasmine.SpyObj<GroupMembershipService>;
  let auth: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    groupService = jasmine.createSpyObj('GroupMembershipService', ['getByDLName', 'addOrRemoveDLMembership']);
    auth = jasmine.createSpyObj('Auth', ['getCurrentUser', 'hasFeatureAccess']);
    auth.getCurrentUser.and.returnValue({ id: 'lomad', name: 'ADSUPPORT /IT/ICICILOMBARD/PRBD' });

    await TestBed.configureTestingModule({
      imports: [GroupMembershipComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GroupMembershipService, useValue: groupService },
        { provide: Auth, useValue: auth },
      ],
    }).compileComponents();

    component = TestBed.createComponent(GroupMembershipComponent).componentInstance;
    component.members = { dlName: 'TEST-DL-CRUD-', dlOwner: 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)' };
    component.usedSource = 'OnPrem';
    component.showform = true;
    component.action = 'Add';
    component.empIDs = ' ilom32725,ilom41623 ';
  });

  describe('Get Details', () => {
    const owner = 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)';

    it('fills DL name, owner and source in the table', async () => {
      groupService.getByDLName.and.returnValue(of({ success: true, data: { dlName: 'TEST-DL-CRUD-', dlOwner: owner } }));
      const fixture = TestBed.createComponent(GroupMembershipComponent);
      const c = fixture.componentInstance;
      c.dlName = 'TEST-DL-CRUD-';
      c.source = 'Cloud';

      c.getMembers();
      fixture.detectChanges();
      await fixture.whenStable();

      const cells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody td')).map((td) => td.textContent?.trim());
      expect(cells).toEqual(['TEST-DL-CRUD-', owner, 'Cloud']);
    });

    it('shows an error instead of an empty table when the API returns no data', () => {
      groupService.getByDLName.and.returnValue(of({ success: true, data: null }));
      component.members = null;
      component.showform = false;
      component.dlName = 'TEST-DL-CRUD-';

      component.getMembers();

      expect(component.showform).toBeFalse();
      expect(component.alertType).toBe('error');
    });

    it('shows the API message for success:false', () => {
      groupService.getByDLName.and.returnValue(of({ success: false, message: 'Unable to fetch DL details.' }));
      component.dlName = 'TEST-DL-CRUD-';
      component.getMembers();
      expect(component.message).toBe('Unable to fetch DL details.');
      expect(component.showform).toBeFalse();
    });
  });

  it('sends the full payload including the logged-in requestor', () => {
    groupService.addOrRemoveDLMembership.and.returnValue(of({ success: true, message: 'Request submitted.', data: null }));

    component.modifyMembership();

    expect(groupService.addOrRemoveDLMembership).toHaveBeenCalledWith({
      dlName: 'TEST-DL-CRUD-',
      dlOwner: 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)',
      action: 'Add',
      empIds: 'ilom32725,ilom41623',
      source: 'OnPrem',
      sendMailAccess: null,
      groupOwnershipChange: null,
      requestorId: 'lomad',
      requestorName: 'ADSUPPORT /IT/ICICILOMBARD/PRBD',
    });
    expect(component.alertType).toBe('success');
    expect(component.message).toBe('Request submitted.');
    expect(component.showform).toBeFalse();
    expect(component.submitting).toBeFalse();
  });

  it('uses the source the DL was fetched from, not the current dropdown', () => {
    groupService.addOrRemoveDLMembership.and.returnValue(of({ success: true, message: 'ok' }));
    component.usedSource = 'Cloud';
    component.source = 'OnPrem';

    component.modifyMembership();

    expect(groupService.addOrRemoveDLMembership.calls.mostRecent().args[0].source).toBe('Cloud');
  });

  it('shows the backend 400 message and keeps the form open', () => {
    const msg = 'No owner is assigned to this DL. Approval email cannot be sent.';
    groupService.addOrRemoveDLMembership.and.returnValue(
      throwError(() => ({ status: 400, error: { success: false, message: msg, data: null } }))
    );

    component.modifyMembership();

    expect(component.message).toBe(msg);
    expect(component.alertType).toBe('error');
    expect(component.showform).toBeTrue();
    expect(component.submitting).toBeFalse();
  });

  it('treats a 200 with success:false as an error', () => {
    groupService.addOrRemoveDLMembership.and.returnValue(of({ success: false, message: 'Something went wrong.' }));

    component.modifyMembership();

    expect(component.alertType).toBe('error');
    expect(component.message).toBe('Something went wrong.');
    expect(component.showform).toBeTrue();
  });

  it('does not submit when the logged-in user cannot be determined', () => {
    auth.getCurrentUser.and.returnValue(null);

    component.modifyMembership();

    expect(groupService.addOrRemoveDLMembership).not.toHaveBeenCalled();
    expect(component.alertType).toBe('error');
  });

  it('does not submit when no employee IDs are entered', () => {
    component.empIDs = '   ';

    component.modifyMembership();

    expect(groupService.addOrRemoveDLMembership).not.toHaveBeenCalled();
    expect(component.alertType).toBe('error');
  });

  it('ignores a second click while a request is in flight', () => {
    component.submitting = true;

    component.modifyMembership();

    expect(groupService.addOrRemoveDLMembership).not.toHaveBeenCalled();
  });
});
