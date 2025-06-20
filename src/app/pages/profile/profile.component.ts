import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import {FormsModule} from '@angular/forms'
import { UserService } from 'src/app/services/api/user.service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  email: string = '';
  changeEmailPassword: string = ''
  newPassword: string = ''
  newPasswordRepeated: string = ''
  changePasswordPassword: string = ''
  
  // Password visibility toggles
  showChangeEmailPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  // Font Awesome icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getEmail();
  }

  async getEmail() {
    await this.authService.refreshAndReplaceToken();
    this.email = this.authService.getDecodedAccessTokenInfo().email || '';
  }

  async changeEmail() {
    if (!this.changeEmailPassword) {
      alert('Please enter a password');
      return;
    }

    try {
      const response = await this.userService.changeEmail(this.email, this.changeEmailPassword);
      if (response.status === 200) {
        // await this.authService.refreshAndReplaceToken();
        // this.getEmail();
        alert('We sent a confirmation email to your new email address. Please verify it to continue.');
        
      } else {
        alert('Failed to update email');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update email');
    }
  }

  async changePassword() {
    if (!this.changePasswordPassword) {
      alert('Please enter a password');
      return;
    }

    if (this.newPassword !== this.newPasswordRepeated) {
      alert('New password and new password repeated do not match');
      return;
    }

    try {
      const response = await this.userService.changePassword(this.changePasswordPassword, this.newPassword);
      if (response.status === 200) {
        alert('Password changed successfully');
        this.changePasswordPassword = '';
        this.newPassword = '';
        this.newPasswordRepeated = '';
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to change password');
    }

  }

}
