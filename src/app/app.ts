import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class App implements OnInit {

  constructor(
    private msal: MsalService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // ✅ MUST initialize first
    await this.msal.instance.initialize();

    // ✅ THEN handle redirect
    const result = await this.msal.instance.handleRedirectPromise();

    if (result?.account) {
      this.msal.instance.setActiveAccount(result.account);
      this.router.navigate(['/dashboard']);
    }
  }
}
