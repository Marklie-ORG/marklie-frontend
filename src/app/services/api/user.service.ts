import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

export interface User {
  uuid: string
  createdAt: string
  updatedAt: string
  firstName: any
  lastName: any
  email: string
  password: string
  activeOrganization: any
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  async me() {
    return firstValueFrom(
      this.http.get<User>(`${this.apiUrl}/me`)
    );
  }

  async updateName(firstName: string, lastName: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/name`, { firstName, lastName })
    );
  }

  async handleFacebookLogin(code: string, redirectUri: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/handle-facebook-login`, { code, redirectUri }, { observe: 'response' })
    );
  }

  async handleSlackLogin(code: string, redirectUri: string, organizationClientId: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/handle-slack-login`, { code, redirectUri, organizationClientId }, { observe: 'response' })
    );
  }

  async changeEmail(email: string, password: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/send-change-email-email`, { email, password }, { observe: 'response' })
    );
  }

  async verifyEmailChange(token: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/verify-email-change`, { token }, { observe: 'response' })
    );
  }

  async changePassword(password: string, newPassword: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/change-password`, { password, newPassword }, { observe: 'response' })
    );
  }

  async sendPasswordRecoveryEmail(email: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/send-password-recovery-email`, { email }, { observe: 'response' })
    );
  }

  async verifyPasswordRecovery(token: string, newPassword: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/verify-password-recovery`, { token, newPassword }, { observe: 'response' })
    );
  }

}
