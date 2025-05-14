import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import {FormsModule} from '@angular/forms'
import { UserService } from 'src/app/services/api/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  email: string = '';
  password: string = ''
  newPassword: string = ''
  newPasswordRepeated: string = ''

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
    if (!this.password) {
      alert('Please enter a password');
      return;
    }

    try {
      const response = await this.userService.changeEmail(this.email, this.password);
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

  changePassword() {
    if (!this.password) {
      alert('Please enter a password');
      return;
    }

    if (this.newPassword !== this.newPasswordRepeated) {
    
    }
  }

}
