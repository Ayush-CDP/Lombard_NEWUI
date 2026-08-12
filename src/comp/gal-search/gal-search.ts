import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { GALService } from '../../services/gal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GALSearchEnum } from '../../Enums/galsearch-enum';
import { Alert } from '../../Shared/alert/alert/alert';
import { GALResult } from '../../Interfaces/GALResult';

@Component({
  selector: 'app-gal-search',
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './gal-search.html',
  styleUrl: './gal-search.css',
})
export class GalSearchComponent {
  GALSearchEnum = GALSearchEnum;

  parameter: GALSearchEnum = GALSearchEnum.DisplayName;
  value = '';

  results: GALResult[] = [];
  selectedUser: GALResult | null = null;

  message = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  isLoading = false;

  // ✅ PAGINATION
  pageSize = 5;
  currentPage = 1;

  constructor(
    private galService: GALService,
    private cd: ChangeDetectorRef,
  ) {}

  private _subs: any[] = [];

  ngOnDestroy(): void {
    this._subs.forEach(s => s?.unsubscribe && s.unsubscribe());
  }

  get totalPages(): number {
    return Math.ceil(this.results.length / this.pageSize);
  }

  get pagedResults(): GALResult[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.results.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

 search(): void {
  if (!this.value.trim()) {
    this.message = 'Please enter a value.';
    this.alertType = 'error';
    return;
  }

  this.resetState();
  this.isLoading = true;

  console.log('HERE >>>> search started');
  console.log('parameter:', this.parameter);
  console.log('value:', this.value);

  const sub = this.galService.search(this.parameter, this.value).subscribe({
    next: (res) => {
      console.log('HERE >>>> API RESPONSE:', res);
      console.log('response type:', typeof res);
      console.log('is array:', Array.isArray(res));

      try {
        this.results = res;
        this.currentPage = 1;

        if (res.length === 1) {
          console.log('HERE >>>> opening modal');
          this.openModal(res[0]);
        } else if (res.length > 1) {
          console.log('HERE >>>> multiple results');

          this.message = 'Multiple users found. Select one.';
          this.alertType = 'success';
        } else {
          console.log('HERE >>>> no results');

          this.message = 'No matching records found.';
          this.alertType = 'error';
        }

        this.isLoading = false;
        this.cd.detectChanges();

        console.log('HERE >>>> completed');
      } catch (err) {
        console.error('ERROR INSIDE next():', err);

        this.isLoading = false;
        this.cd.detectChanges();
      }
    },

    error: (err) => {
      console.error('API ERROR:', err);

      this.currentPage = 1;
      this.message = 'Search failed (API error)';
      this.alertType = 'error';
      this.isLoading = false;

      this.cd.detectChanges();
    },
  });

  this._subs.push(sub);
}

  openModal(user: GALResult) {
    this.selectedUser = user;
  }

  goBackToResults() {
    this.selectedUser = null;
  }

  clearSearch() {
    this.value = '';
    this.resetState();
  }

  private resetState() {
    this.results = [];
    this.selectedUser = null;
    this.message = '';
    this.alertType = 'info';
    this.currentPage = 1;
  }
}
