import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {

  constructor(
    private msal: MsalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const accounts = this.msal.instance.getAllAccounts();

    if (accounts.length > 0) {
      this.msal.instance.setActiveAccount(accounts[0]);
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.msal.loginRedirect(); // ✅ NO subscribe
  }
}
