import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  async createOrganization(name: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/organization`, {
        name: name
      }, { observe: 'response' })
    );
  }

  async generateInviteCode() {
    return firstValueFrom(
      this.http.get<{
        inviteCode: string;
      }>(`${this.apiUrl}/invite-code`, { observe: 'response' })
    );
  }

  async useInviteCode(code: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/invite-code`, {
        code: code  
      }, { observe: 'response' })
    );
  }
  
}
