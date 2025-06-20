import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/api/auth.service.js';
import { Router } from '@angular/router';
import {AuthDialogComponent} from "../auth-dialog/auth-dialog.component.js";
import { AuthFormService } from 'src/app/services/auth-form.service.js';
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
    private router: Router,
    public formService: AuthFormService
  ) {}

  showSignUpModal() {
    this.dialog.open(AuthDialogComponent, {
      width: '400px'
    });
  }

  navigateLogin() {
    this.formService.saveFormData({
      email: '',
      password: '',
      isSignInMode: true,
      isSignUpMode: false,
      isForgotPasswordMode: false
    });
    this.router.navigate(['/auth']);
  }

  navigateRegister() {
    this.formService.saveFormData({
      email: '',
      password: '',
      isSignInMode: false,
      isSignUpMode: true,
      isForgotPasswordMode: false
    });
    this.router.navigate(['/auth']);
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
