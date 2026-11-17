import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { featureAccessGuard } from './feature-access.guard';
import { Auth } from '../services/auth';
import { routes } from './app.routes';

describe('featureAccessGuard', () => {
  let auth: jasmine.SpyObj<Auth>;

  beforeEach(() => {
    auth = jasmine.createSpyObj('Auth', ['hasFeatureAccess']);
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: Auth, useValue: auth }],
    });
  });

  const run = () => TestBed.runInInjectionContext(() => featureAccessGuard({} as any, {} as any));

  it('allows users with Feature.Access', () => {
    auth.hasFeatureAccess.and.returnValue(true);
    expect(run()).toBeTrue();
  });

  it('sends users without the role to GAL Search', () => {
    auth.hasFeatureAccess.and.returnValue(false);
    const result = run() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/dashboard/gal-search');
  });

  it('is on Group Membership and Rights Management, not on /approval', () => {
    const children = routes.find((r) => r.path === 'dashboard')!.children!;
    const guardsOf = (path: string) => children.find((r) => r.path === path)?.canActivate ?? [];
    expect(guardsOf('group-membership')).toContain(featureAccessGuard);
    expect(guardsOf('rights-management')).toContain(featureAccessGuard);
    expect(routes.find((r) => r.path === 'approval')!.canActivate).not.toContain(featureAccessGuard);
  });
});
