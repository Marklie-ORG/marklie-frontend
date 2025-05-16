import { Component } from '@angular/core';
import { AuthService } from '../../services/api/auth.service.js';
import { Router } from '@angular/router';
import { SignUpFormService } from '../../services/api/signup-form.service.js';
import { MatDialogRef } from '@angular/material/dialog';
import {HttpErrorResponse} from "@angular/common/http";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
    public dialogRef: MatDialogRef<RegisterComponent>,
    public formService: SignUpFormService
  ) {
    const saved = this.formService.getFormData();
    this.email = saved.email;
    this.password = saved.password;
  }

  toggleMode() {
    this.formService.saveFormData({
      email: this.email,
      password: this.password,
      isSignInMode: true
    });
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.validateEmail() || !this.validatePassword()) {
      return
    }
    try {
      const res = await this.authService.register(this.email, this.password);
      this.authService.setToken(res.accessToken);
      this.formService.clearFormData();
      this.dialogRef.close();
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
    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    }
    this.passwordError = '';
    return true;
  }
}
