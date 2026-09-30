import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit, OnDestroy {

  private readonly destroying$ = new Subject<void>();

  constructor(
    private msal: MsalService,
    private msalBroadcast: MsalBroadcastService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // Wait for MSAL to finish processing the redirect (token exchange)
    // before checking accounts. Without this, the app renders before
    // MSAL has stored the token → blank screen on first login.
    this.msalBroadcast.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        const accounts = this.msal.instance.getAllAccounts();

        if (accounts.length > 0) {
          this.msal.instance.setActiveAccount(accounts[0]);
          this.router.navigate(['/dashboard']);
        } else {
          this.msal.loginRedirect();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }

  login(): void {
    this.msal.loginRedirect();
  }
}