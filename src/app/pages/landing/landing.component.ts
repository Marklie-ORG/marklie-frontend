import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {AuthDialogComponent} from "../../components/auth-dialog/auth-dialog.component.js";

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

  headline: string = 'Set up automated Facebook reports.<br>Save time, increase client retention.';
  // headline: string = 'Communicate With Clients Proactively.<br>Boost Retention With Automated Reports';

  subheadline: string = 'Connect your Facebook, set up once, and we handle the rest.<br>Clients love regular updates — we make it automatic.';
  // subheadline: string = 'Connect your Facebook account instantly,<br>set up custom regular reports in minutes, <br>and we will deliver regular automated reports to your clients on your behalf. <br>Save time and increase client retention.';

  // 'Our platform generates and sends detailed Facebook performance reports, freeing up your time and keeping your clients engaged and informed.'
  // 'Create and schedule comprehensive Facebook reports in minutes. Spend more time on strategy and client growth, not tedious data entry.'

  ngOnInit() {
    // Check if user is already logged in
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.router.navigate(['/home']);
    }
  }

  showSignUpModal() {
    this.dialog.open(AuthDialogComponent, {
      width: '400px'
    });
  }

  onLogin() {
    this.router.navigate(['/dashboard']);
  }

}
