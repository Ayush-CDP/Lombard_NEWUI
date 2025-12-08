import { Component } from '@angular/core';
import { Sidebar } from '../SharedComps/sidebar/sidebar';
import { Loader } from '../SharedComps/loader/loader';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Loader, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(private msal: MsalService, private router: Router) {}

  logout() {
    this.msal.logoutPopup();
    this.router.navigate(['/login']);
  }
}
