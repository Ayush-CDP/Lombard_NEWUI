import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AccountUnlockComponent } from './account-unlock';
import { AccountUnlockService } from '../../services/account-unlock';
import { Auth } from '../../services/auth';

describe('AccountUnlockComponent user details', () => {
  let fixture: ComponentFixture<AccountUnlockComponent>;
  let component: AccountUnlockComponent;
  let service: jasmine.SpyObj<AccountUnlockService>;

  // Exact response from the API.
  const apiResponse = {
    success: true,
    message: null,
    data: {
      employeeId: 'ILOM35124',
      isLocked: false,
      accountStatus: 'Enabled',
      accountExpiry: '24 Apr 2027',
      passwordExpiryStatus: '03 Nov 2026',
    },
  };

  /** Table as { header: value }. */
  const table = (): Record<string, string> => {
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.modern-table tr'));
    return Object.fromEntries(
      rows.map((r) => [r.querySelector('th')?.textContent?.trim() ?? '', r.querySelector('td')?.textContent?.trim() ?? ''])
    );
  };

  async function load(res: any): Promise<void> {
    service.getUserDetails.and.returnValue(of(res));
    component.employeeId = 'ILOM35124';
    component.getUserDetails();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    service = jasmine.createSpyObj('AccountUnlockService', ['getUserDetails', 'unlockAccount']);
    const auth = jasmine.createSpyObj('Auth', ['hasFeatureAccess']);
    auth.hasFeatureAccess.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [AccountUnlockComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AccountUnlockService, useValue: service },
        { provide: Auth, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountUnlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fills every field from the API response, including Password Expiry Date', async () => {
    await load(apiResponse);
    expect(table()).toEqual({
      'Employee ID': 'ILOM35124',
      'Locked': 'No',
      'Account Status': 'Enabled',
      'Account Expiry Date': '24 Apr 2027',
      'Password Expiry Date': '03 Nov 2026',
    });
  });

  it('still reads the older passwordStatus field', async () => {
    const { passwordExpiryStatus, ...rest } = apiResponse.data;
    await load({ ...apiResponse, data: { ...rest, passwordStatus: 'Password Expired' } });
    expect(table()['Password Expiry Date']).toBe('Password Expired');
  });

  it('fills Password Expiry Date from the live API response (passwordStatus, empty info)', async () => {
    await load({
      success: true,
      message: null,
      data: {
        employeeId: '1053795',
        isLocked: false,
        accountStatus: 'Enabled',
        accountExpiry: 'Never',
        passwordStatus: '27 Dec 2026',
        info: '',
      },
    });
    expect(table()).toEqual({
      'Employee ID': '1053795',
      'Locked': 'No',
      'Account Status': 'Enabled',
      'Account Expiry Date': 'Never',
      'Password Expiry Date': '27 Dec 2026',
    });
  });

  it('shows "Not available" instead of a blank cell for missing values', async () => {
    await load({ success: true, data: { employeeId: 'ILOM35124', isLocked: true, accountStatus: '', accountExpiry: null } });
    const t = table();
    expect(t['Account Status']).toBe('Not available');
    expect(t['Account Expiry Date']).toBe('Not available');
    expect(t['Password Expiry Date']).toBe('Not available');
    expect(t['Locked']).toBe('Yes');
    expect(Object.values(t).every((v) => v.length > 0)).toBeTrue();
  });

  it('shows Info rows only when the API sends them', async () => {
    await load({ ...apiResponse, data: { ...apiResponse.data, info: 'Contract ends 2027' } });
    expect(table()['Info']).toBe('Contract ends 2027');
  });

  it('success with no data shows an error, not an empty table', async () => {
    await load({ success: true, message: null, data: null });
    expect(component.user).toBeNull();
    expect(component.alertType).toBe('error');
    expect((fixture.nativeElement as HTMLElement).querySelector('.modern-table')).toBeNull();
  });

  it('shows the unlock button only when the account is locked', async () => {
    await load(apiResponse);
    expect(component.showunlockbtn).toBeFalse();
    await load({ ...apiResponse, data: { ...apiResponse.data, isLocked: true } });
    expect(component.showunlockbtn).toBeTrue();
  });
});
