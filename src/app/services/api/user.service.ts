import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

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

}
