import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SignUpComponent } from '../../components/sign-up/sign-up.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  headline: string = 'Communicate With Clients Proactively.<br>Boost Retention With Automated Reports';

  headlines: string[] = [
    'Automated Facebook Reports.<br>Happy Clients, Effortless Growth',
    'Stop Wasting Hours on Manual Reports.<br>Retain Clients with Automated Facebook Insights',
    'Scale Your Agency, Not Your Reporting Time.<br>Instant, Automated Facebook Reports',
    'Deliver Proactive Facebook Insights.<br>Boost Client Retention, Automatically',
    'Facebook Reports.<br>Automated. Simplified. Growth.'
  ]

  subheadline: string = 'Connect your Facebook or TikTok account,<br>set up custom regular reports, and deliver<br>insights to your clients, all on autopilot.';

  subheadlines: string[] = [
    'Connect your Facebook account, set up custom weekly or monthly reports, and deliver valuable insights to your clients, all on autopilot.',
    'Our platform generates and sends detailed Facebook performance reports, freeing up your time and keeping your clients engaged and informed.',
    'Create and schedule comprehensive Facebook reports in minutes. Spend more time on strategy and client growth, not tedious data entry.',
    'Impress your clients with consistent, data-driven reports. Our automated system delivers key metrics directly to their inbox.',
    'Instantly connect your facebook accounts, and schedule automatic reports. Save time and increase client retention.'
  ];

  ngOnInit() {
    // this.setupHeadline();
    // this.setupSubheadline();

    // Check if user is already logged in
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.router.navigate(['/home']);
    }
  }

  setupHeadline() {
    this.headline = this.headlines[Math.floor(Math.random() * this.headlines.length)];
  }

  setupSubheadline() {
    this.subheadline = this.subheadlines[Math.floor(Math.random() * this.subheadlines.length)];
  }

  showSignUpModal() {
    this.dialog.open(SignUpComponent, {
      width: '400px'
    });
  }

  onLogin() {
    this.router.navigate(['/dashboard']);
  }

}
