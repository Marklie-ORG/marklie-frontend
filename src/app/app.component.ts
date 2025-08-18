import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  showHeader = true;
  showDashboardHeader = false;
  showLandingHeader = true;

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url.split('?')[0];
        const hasToken = !!localStorage.getItem('accessToken');

        this.showLandingHeader = !hasToken && url === '/';
        this.showHeader = hasToken && url === '/';

        this.showDashboardHeader =
          url === '/dashboard' ||
          url.startsWith('/client/') ||
          url === '/profile' ||
          url.startsWith('/view-report/') ||
          url.startsWith('/reports') ||
          url.startsWith('/suggested-features');
          url.startsWith('/billing');
      }
    });
  }

  onActivate(event: any) {
    this.showDashboardHeader = event.url === '/dashboard';
  }
}
