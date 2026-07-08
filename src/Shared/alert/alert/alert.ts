import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert implements OnChanges {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'info';
  @Input() autoCloseMs: number | null = null; // override auto-close time (ms). null = use defaults, 0 = disable

  @Output() closed = new EventEmitter<void>();

  displayMessage = '';
  private _timer: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this._setDisplay(changes['message'].currentValue || '');
    }
  }

  private _setDisplay(msg: string) {
    this._clearTimer();
    this.displayMessage = msg || '';

    if (!this.displayMessage) return;

    let timeout = 4500; // default
    if (this.autoCloseMs !== null && this.autoCloseMs !== undefined) {
      timeout = this.autoCloseMs || 0;
    } else {
      // slightly longer for errors
      if (this.type === 'error') timeout = 6000;
      if (this.type === 'info') timeout = 4000;
      if (this.type === 'success') timeout = 3500;
    }

    if (timeout > 0) {
      this._timer = setTimeout(() => this._doClose(), timeout);
    }
  }

  Close(): void {
    this._doClose();
  }

  private _doClose() {
    this._clearTimer();
    this.displayMessage = '';
    this.closed.emit();
  }

  private _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}

