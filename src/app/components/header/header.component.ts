import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/api/auth.service.js';
import { Router } from '@angular/router';
import {AuthDialogComponent} from "../auth-dialog/auth-dialog.component.js";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMobileMenuOpen: boolean = false;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {}

  showSignUpModal() {
    this.dialog.open(AuthDialogComponent, {
      width: '400px'
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  get isSignedIn() {
    return this.authService.hasAccessToken();
  }

}
