import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { Auth } from '../../../services/auth';

describe('Sidebar menu', () => {
  async function menuFor(isAdmin: boolean): Promise<string[]> {
    const auth = jasmine.createSpyObj('Auth', ['hasFeatureAccess']);
    auth.hasFeatureAccess.and.returnValue(isAdmin);
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: Auth, useValue: auth }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    await fixture.whenStable();
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('nav.sidebar-links a')).map(
      (a) => a.getAttribute('routerLink') ?? ''
    );
  }

  it('normal users see GAL Search, Group Membership and Rights Management, not Account Unlock', async () => {
    expect(await menuFor(false)).toEqual(['gal-search', 'group-membership', 'rights-management']);
  });

  it('admins (Feature.Access) also see Account Unlock', async () => {
    expect(await menuFor(true)).toEqual(['account-unlock', 'gal-search', 'group-membership', 'rights-management']);
  });
});
