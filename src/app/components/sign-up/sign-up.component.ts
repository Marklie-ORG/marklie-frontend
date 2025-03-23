import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SignUpFormService } from '../../services/signup-form.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  currentStep: number = 0;
  showPassword: boolean = false;
  emailError: string = '';
  passwordError: string = '';
  isSignInMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialogRef: MatDialogRef<SignUpComponent>,
    private formService: SignUpFormService
  ) {}

  ngOnInit() {
    // Load saved form data when component initializes
    const savedData = this.formService.getFormData();
    this.email = savedData.email;
    this.password = savedData.password;
    this.isSignInMode = savedData.isSignInMode;
    // Save form data when dialog is closed
    this.dialogRef.beforeClosed().subscribe(() => {
      this.saveFormData();
    });
  }

  ngOnDestroy() {
    // Save form data when component is destroyed
    this.saveFormData();
  }

  private saveFormData() {
    this.formService.saveFormData({
      email: this.email,
      password: this.password,
      isSignInMode: this.isSignInMode
    });
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      this.emailError = 'Email is required';
      return false;
    }
    if (!emailRegex.test(email)) {
      this.emailError = 'Please enter a valid email';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword(password: string): boolean {
    if (!password) {
      this.passwordError = 'Password is required';
      return false;
    }
    if (password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  async onSubmit() {
    // Reset errors
    this.emailError = '';
    this.passwordError = '';

    // Validate both fields
    const isEmailValid = this.validateEmail(this.email);
    const isPasswordValid = this.validatePassword(this.password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      // todo if sign in mode, sign in, dashboard; else sign up, onboarding
      // Clear saved form data on successful submission
      this.formService.clearFormData();
      this.dialogRef.close();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }

  onForgotPassword() {
    this.dialogRef.close();
    this.router.navigate(['/forgot-password']);
  }

  toggleMode() {
    this.isSignInMode = !this.isSignInMode;
    this.emailError = '';
    this.passwordError = '';
  }
}
