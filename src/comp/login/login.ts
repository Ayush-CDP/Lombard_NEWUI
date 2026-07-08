import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {

  constructor(
    private msal: MsalService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {

    const accounts = this.msal.instance.getAllAccounts();

    if (accounts.length > 0) {
      this.msal.instance.setActiveAccount(accounts[0]);
      this.router.navigate(['/dashboard']);
      return;
    }

    // No account present -> redirect to SSO unless this is a redirect callback
    if (!this.isInRedirectFlow()) {
      this.msal.loginRedirect();
    }
  }

  private isInRedirectFlow(): boolean {
    const url = window.location.href;
    return url.includes('code=') || url.includes('state=') || url.includes('error=');
  }

  login(): void {
    this.msal.loginRedirect();
  }
}