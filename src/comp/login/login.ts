import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
constructor(private msal: MsalService, private router: Router) {}

ngOnInit() {
  const loggedIn = this.msal.instance.getAllAccounts().length > 0;
  if (loggedIn) {
    this.router.navigate(['/dashboard']);
  }else{
    this.login();
  }
}

login() {
  this.msal.loginPopup().subscribe({
    next: () => {
      this.router.navigate(['/dashboard']);
    },
    error: (err) => console.error(err)
  });
}


}
