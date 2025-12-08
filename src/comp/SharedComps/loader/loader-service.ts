import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  public isLoading = signal(false);
  private requests = 0;

  show() {
    this.requests++;
    this.isLoading.set(true);
  }

  hide() {
    this.requests--;
    if (this.requests <= 0) {
      this.requests = 0;
      this.isLoading.set(false);
    }
  }
}
