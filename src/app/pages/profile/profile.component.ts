import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import {FormsModule} from '@angular/forms'
import { UserService } from 'src/app/services/api/user.service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { OrganizationService } from 'src/app/services/api/organization.service';

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
  isOwner: boolean = false;

  inviteCodes: OrganizationInvite[] = [];
  loadingInviteCodes: boolean = false;
  generatingInviteCode: boolean = false;
  latestGeneratedCode: string | null = null;
  
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
    private userService: UserService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.getEmail();
    this.checkOwnershipAndLoadInvites();
  }

  async getEmail() {
    await this.authService.refreshAndReplaceToken();
    this.email = this.authService.getDecodedAccessTokenInfo().email || '';
  }

  async checkOwnershipAndLoadInvites() {
    try {
      // Determine if the user is OWNER for the active organization
      const user = await this.userService.me();
      const tokenInfo = this.authService.getDecodedAccessTokenInfo();
      const roles = (tokenInfo?.roles || []) as { role: string; organizationUuid: string }[];
      const activeOrgUuid = user?.activeOrganization?.uuid || user?.activeOrganization;
      this.isOwner = !!roles.find(r => r.organizationUuid === activeOrgUuid && r.role === 'owner');

      if (this.isOwner) {
        await this.loadInviteCodes();
      }
    } catch (err) {
      console.error('Failed to check ownership or load invites', err);
    }
  }

  async loadInviteCodes() {
    this.loadingInviteCodes = true;
    try {
      const response = await this.organizationService.listInviteCodes();
      if ((response as any)?.status === 200) {
        this.inviteCodes = (response as any).body || [];
      } else if (Array.isArray(response)) {
        this.inviteCodes = response;
      }
    } finally {
      this.loadingInviteCodes = false;
    }
  }

  async generateInviteCode() {
    if (this.generatingInviteCode) return;
    this.generatingInviteCode = true;
    try {
      const response = await this.organizationService.generateInviteCode();
      const code = (response as any)?.body?.inviteCode || (response as any)?.inviteCode;
      if (code) {
        this.latestGeneratedCode = code;
        await this.loadInviteCodes();
      }
    } catch (err) {
      console.error('Failed to generate invite code', err);
      alert('Failed to generate invite code');
    } finally {
      this.generatingInviteCode = false;
    }
  }

  getInviteStatus(invite: OrganizationInvite): string {
    if (invite.usedAt) return 'Used';
    const now = new Date();
    const expires = new Date(invite.expiresAt);
    return expires < now ? 'Expired' : 'Active';
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

interface OrganizationInvite {
  uuid: string;
  code: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string;
  createdAt: string;
  updatedAt: string;
}

