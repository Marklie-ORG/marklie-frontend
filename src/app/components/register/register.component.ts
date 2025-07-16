import { Component } from '@angular/core';
import { AuthService } from '../../services/api/auth.service.js';
import { Router } from '@angular/router';
import { AuthFormService } from '../../services/auth-form.service.js';
// import { MatDialogRef } from '@angular/material/dialog';
import {HttpErrorResponse} from "@angular/common/http";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { isEmail } from 'validator';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  emailError = '';
  passwordError = '';
  formError = '';
  showPassword = false;
  submitted = false;

  // Font Awesome icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(
    private authService: AuthService,
    private router: Router,
    public formService: AuthFormService
  ) {
    const saved = this.formService.getFormData();
    this.email = saved.email;
    this.password = saved.password;
  }

  toggleSignInMode() {
    this.formService.saveFormData({
      email: this.email,
      password: this.password,
      isSignInMode: true,
      isSignUpMode: false,
      isForgotPasswordMode: false
    });
  }

  async onSubmit() {
    this.submitted = true;
    const passwordValidated = this.validatePassword();
    const emailValidated = this.validateEmail();
    if (!emailValidated || !passwordValidated) {
      return
    }
    try {
      const res = await this.authService.register(this.email, this.password);
      this.authService.setToken(res.accessToken);
      this.formService.clearFormData();
      // this.dialogRef.close();
      this.router.navigate(['/onboarding']);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 400) {
        this.formError = "Wrong credentials";
      }
    }
  }

  validateEmail(): boolean {
    if (!this.email) {
      this.emailError = 'Email is required';
      return false;
    }
    if (!isEmail(this.email)) {
      this.emailError = 'Enter valid email address';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    }
    if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      return false;
    }
    this.passwordError = '';
    return true;
  }
}
