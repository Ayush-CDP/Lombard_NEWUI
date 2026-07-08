import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GalSearchComponent } from './gal-search';
import { GALService } from '../../services/gal';
import { GALResult } from '../../Interfaces/GALResult';

describe('GalSearchComponent', () => {
  let component: GalSearchComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalSearchComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: GALService,
          useValue: { search: jasmine.createSpy('search').and.returnValue(of([])) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display band when selectedUser includes band data', () => {
    component.selectedUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      grade: 'G5',
      initials: 'JD',
      display: 'Jane Doe',
      knownAs: 'Jane',
      workStationID: 'WS123',
      company: 'Acme',
      designation: 'Engineer',
      empNo: '12345',
      group: 'Team A',
      location: 'Mumbai',
      department: 'IT',
      manager: 'John Doe',
      directReports: '2',
      mainGroup: 'Main',
      costCenter: '100',
      region: 'APAC',
      boardNo: '999',
      directPhone: '1234567890',
      emailAddress: 'jane.doe@acme.com',
      mobile: '9876543210',
      business: 'Sales',
      countryCode: 'IN',
      business2: 'Support',
      cityCode: 'MUM',
      fax: '000',
      home: '111',
      addressLocation: 'Office',
      address: '123 Main St',
      state: 'MH',
      zipCode: '400001',
      country: 'India',
      band: 'G6',
    } as GALResult;

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Band');
    expect(compiled.textContent).toContain('G6');
  });
});