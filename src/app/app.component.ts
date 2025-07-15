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

  constructor(private router: Router) {
    // Listen to route changes
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // console.log(event.url)
        const url = event.url.split('?')[0];
        this.showHeader =
          url === '/'
          // ||
          // url === '/auth';

        this.showDashboardHeader =
          url === '/dashboard' ||
          url.startsWith('/client/') ||
          url === '/profile' ||
          // url.startsWith('/edit-report/') ||
          // url.startsWith('/schedule-report/') ||
          url.startsWith('/review-report/') ||
          url.startsWith('/reports');
      }
    });
  }

  onActivate(event: any) {
    this.showDashboardHeader = event.url === '/dashboard';
  }
}
