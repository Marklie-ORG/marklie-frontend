import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthFormService } from 'src/app/services/auth-form.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/api/auth.service';
import { UserService } from 'src/app/services/api/user.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.scss'
})
export class PasswordRecoveryComponent {
  password = '';
  passwordConfirmation = '';
  passwordError = '';
  passwordConfirmationError = '';
  formError = '';
  showPassword = false;
  showPasswordConfirmation = false;
  submitted = false;

  token = '';

  // Font Awesome icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private formService: AuthFormService
  ) {

    this.token = this.route.snapshot.queryParams['token'];
  }

  async onSubmit() {
    this.submitted = true;
    const passwordValidated = this.validatePassword();
    if (!passwordValidated) {
      return
    }
    try {
      const res = await this.userService.verifyPasswordRecovery(this.token, this.password);

      this.formService.saveFormData({
        email: "",
        password: this.password,
        isSignInMode: true,
        isSignUpMode: false,
        isForgotPasswordMode: false
      });

      this.router.navigate(['/auth']);
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        // this.formError = "Wrong credentials";
        if (err.error.message.includes("expired")) {
          this.formError = "Link has expired";
        }
        if (err.error.message.includes("already used")) {
          this.formError = "Link already used";
        }
      }
    }
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    }
    if (this.password !== this.passwordConfirmation) {
      this.passwordConfirmationError = 'Passwords do not match';
      return false;
    }
    if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      return false;
    }
    this.passwordError = '';
    this.passwordConfirmationError = '';
    return true;
  }

}
