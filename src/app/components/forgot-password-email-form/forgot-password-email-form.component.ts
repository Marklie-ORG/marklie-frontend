import { Component } from '@angular/core';
import { AuthFormService } from '../../services/auth-form.service.js';
// import { MatDialogRef } from '@angular/material/dialog';
import {HttpErrorResponse} from "@angular/common/http";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { UserService } from 'src/app/services/api/user.service.js';

@Component({
  selector: 'forgot-password-email-form',
  templateUrl: './forgot-password-email-form.component.html',
  styleUrl: './forgot-password-email-form.component.scss'
})
export class ForgotPasswordEmailFormComponent {
  email = '';
  emailError = '';
  formError = '';
  submitted = false;

  // Font Awesome icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  isLinkSent = false;

  constructor(
    public formService: AuthFormService,
    private userService: UserService
  ) {
    const saved = this.formService.getFormData();
    this.email = saved.email;
  }

  toggleSignInMode() {
    this.formService.saveFormData({
      email: this.email,
      password: this.formService.getFormData().password,
      isSignInMode: true,
      isSignUpMode: false,
      isForgotPasswordMode: false
    });
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.validateEmail()) {
      return
    }
    try {
      const res = await this.userService.sendPasswordRecoveryEmail(this.email);
      this.isLinkSent = true;
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
}
