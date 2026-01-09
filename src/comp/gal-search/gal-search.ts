import { ChangeDetectorRef, Component } from '@angular/core';
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

  results: GALResult | null = null;

  message = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private galService: GALService,
    private cd: ChangeDetectorRef
  ) {}

  search(): void {
    if (!this.value.trim()) {
      this.message = 'Please enter a value.';
      this.alertType = 'error';
      this.cd.detectChanges();
      return;
    }

    this.galService.search(this.parameter, this.value).subscribe({
      next: (res) => {
        this.results = res;
        this.message = '';
        this.alertType = 'success';
        this.cd.detectChanges();
      },
      error: () => {
        this.results = null;
        this.message = 'No matching records found.';
        this.alertType = 'error';
        this.cd.detectChanges();
      },
    });
  }
}

