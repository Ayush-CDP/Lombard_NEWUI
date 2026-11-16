import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RightsManagementComponent } from './rights-management';
import { RightsManagementService } from '../../services/rights-management';
import { Auth } from '../../services/auth';

describe('RightsManagementComponent submit', () => {
  let component: RightsManagementComponent;
  let rightsService: jasmine.SpyObj<RightsManagementService>;
  let auth: jasmine.SpyObj<Auth>;
  const apiMsg = 'This request has been sent to the DL owner for approval via email.';

  beforeEach(async () => {
    rightsService = jasmine.createSpyObj('RightsManagementService', ['getByDLName', 'addOrRemoveRights']);
    auth = jasmine.createSpyObj('Auth', ['getCurrentUser', 'hasFeatureAccess']);
    auth.getCurrentUser.and.returnValue({ id: 'lomad', name: 'ADSUPPORT /IT/ICICILOMBARD/PRBD' });

    await TestBed.configureTestingModule({
      imports: [RightsManagementComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RightsManagementService, useValue: rightsService },
        { provide: Auth, useValue: auth },
      ],
    }).compileComponents();

    component = TestBed.createComponent(RightsManagementComponent).componentInstance;
    component.rights = { dlName: 'TEST-DL-CRUD-', dlOwner: 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)' };
    component.usedSource = 'Cloud';
    component.showform = true;
    component.action = 'Add';
    component.operationType = 'SendEmailAccess';
    component.rightsInput = ' ilom32725 , ilom41623 ';
  });

  describe('View Rights', () => {
    const owner = 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)';

    beforeEach(() => {
      component.rights = null;
      component.showform = false;
      component.dlName = ' TEST-DL-CRUD- ';
      component.source = 'OnPrem';
    });

    it('fills DL details from the bare (non-enveloped) API response and renders the row', async () => {
      rightsService.getByDLName.and.returnValue(of({ dlName: 'TEST-DL-CRUD-', dlOwner: owner, action: null }));
      const fixture = TestBed.createComponent(RightsManagementComponent);
      const c = fixture.componentInstance;
      c.dlName = 'TEST-DL-CRUD-';
      c.source = 'OnPrem';

      c.getRights();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(rightsService.getByDLName).toHaveBeenCalledWith('TEST-DL-CRUD-', 'OnPrem');
      expect(c.rights).toEqual({ dlName: 'TEST-DL-CRUD-', dlOwner: owner });
      const cells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody td')).map((td) => td.textContent?.trim());
      expect(cells).toEqual(['TEST-DL-CRUD-', owner, 'On-Prem']);
    });

    it('still works if the API wraps the result in { data }', () => {
      rightsService.getByDLName.and.returnValue(of({ success: true, data: { dlName: 'TEST-DL-CRUD-', dlOwner: owner } }));
      component.getRights();
      expect(component.rights).toEqual({ dlName: 'TEST-DL-CRUD-', dlOwner: owner });
      expect(component.showform).toBeTrue();
    });

    it('shows "No owner assigned" instead of an empty owner cell', async () => {
      rightsService.getByDLName.and.returnValue(of({ dlName: 'TEST-DL-CRUD-', dlOwner: null }));
      const fixture = TestBed.createComponent(RightsManagementComponent);
      const c = fixture.componentInstance;
      c.dlName = 'TEST-DL-CRUD-';
      c.getRights();
      fixture.detectChanges();
      await fixture.whenStable();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('No owner assigned');
    });

    it('shows an error (not an empty table) when no details come back', () => {
      rightsService.getByDLName.and.returnValue(of(null as any));
      component.getRights();
      expect(component.showform).toBeFalse();
      expect(component.alertType).toBe('error');
      expect(component.message).toContain('No details found');
    });
  });

  it('sends the requestor and shows the API message in the green alert', () => {
    rightsService.addOrRemoveRights.and.returnValue(of({ message: apiMsg }));

    component.modifyRights();

    expect(rightsService.addOrRemoveRights).toHaveBeenCalledWith({
      dlName: 'TEST-DL-CRUD-',
      dlOwner: 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)',
      action: 'Add',
      rights: 'ilom32725,ilom41623',
      source: 'Cloud',
      requestorId: 'lomad',
      requestorName: 'ADSUPPORT /IT/ICICILOMBARD/PRBD',
      sendMailAccess: 'Allow',
    });
    expect(component.alertType).toBe('success');
    expect(component.message).toBe(apiMsg);
    expect(component.showform).toBeFalse();
  });

  it('Group Ownership Change + Remove sends groupOwnershipChange: Deny', () => {
    rightsService.addOrRemoveRights.and.returnValue(of({ message: apiMsg }));
    component.operationType = 'GroupOwnershipChange';
    component.action = 'Remove';

    component.modifyRights();

    const dto = rightsService.addOrRemoveRights.calls.mostRecent().args[0];
    expect(dto.groupOwnershipChange).toBe('Deny');
    expect(dto.sendMailAccess).toBeUndefined();
    expect(dto.action).toBe('Remove');
  });

  it('shows the API 400 message and keeps the form open', () => {
    rightsService.addOrRemoveRights.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Requestor ID is missing or invalid.' } }))
    );

    component.modifyRights();

    expect(component.alertType).toBe('error');
    expect(component.message).toBe('Requestor ID is missing or invalid.');
    expect(component.showform).toBeTrue();
    expect(component.submitting).toBeFalse();
  });

  it('blocks submit when the logged-in user cannot be identified', () => {
    auth.getCurrentUser.and.returnValue(null);
    component.modifyRights();
    expect(rightsService.addOrRemoveRights).not.toHaveBeenCalled();
    expect(component.alertType).toBe('error');
  });

  it('blocks submit for invalid IDs', () => {
    component.rightsInput = 'ilom1, bad id!';
    component.modifyRights();
    expect(rightsService.addOrRemoveRights).not.toHaveBeenCalled();
    expect(component.message).toContain("Only letters, digits, '.', '_' and '-' are allowed.");
  });

  it('blocks submit when no IDs are entered', () => {
    component.rightsInput = ' , ';
    component.modifyRights();
    expect(rightsService.addOrRemoveRights).not.toHaveBeenCalled();
    expect(component.alertType).toBe('error');
  });

  it('ignores a second click while a request is in flight', () => {
    component.submitting = true;
    component.modifyRights();
    expect(rightsService.addOrRemoveRights).not.toHaveBeenCalled();
  });
});
