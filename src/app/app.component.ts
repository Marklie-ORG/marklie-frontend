import { Component,inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { AuthService } from './services/api/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  showHeader = true;
  showDashboardHeader = false;
  showLandingHeader = true;

  private authService = inject(AuthService);

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects.split('?')[0];
        const hasToken = !!localStorage.getItem('accessToken');

        this.showLandingHeader = !hasToken && url === '/';
        this.showHeader = hasToken && url === '/';

        if (!hasToken) {
          return
        }

        const decodedToken = this.authService.getDecodedAccessTokenInfo();

        this.showDashboardHeader =
          (url === '/dashboard' || //
          url.startsWith('/client/') || //
          url === '/profile' ||
          url.startsWith('/view-report/') ||
          url.startsWith('/scheduled-reports') ||
          url.startsWith('/reports-database') ||
          url.startsWith('/suggested-features') ||
          url.startsWith('/access-requests') ||
          url.startsWith('/billing')) && !decodedToken.isClientAccessToken;
      }
    });
  }

  onActivate(event: any) {
    this.showDashboardHeader = event.url === '/dashboard';
  }
}
