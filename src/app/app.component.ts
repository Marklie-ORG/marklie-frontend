import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  showHeader = true;
  showDashboardHeader = false;

  constructor(private router: Router) {
    // Listen to route changes
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showHeader = event.url === '/';

        this.showDashboardHeader = event.url === '/dashboard';
      }
    });
  }

  onActivate(event: any) {
    this.showDashboardHeader = event.url === '/dashboard';
  }
}
