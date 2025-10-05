import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

export interface ClientAccessRequest {
  uuid: string;
  email: string;
  isGranted: boolean;
  createdAt: string;
  updatedAt: string;
  organizationClient?: {
    uuid: string;
    name: string;
  };
}

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
      }>(`${this.apiUrl}/`, {
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

  async getSchedulingOptions(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/scheduling-options`));
  }

  async listInviteCodes() {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/invite-codes`, { observe: 'response' })
    );
  }

  async getLogs(orgUuid: string) {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/${orgUuid}/logs`)
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

  async shareClientDatabase(clientUuid: string, emails: string[]) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/share-client-database`, { clientUuid, emails }, { observe: 'response' })
    );
  }

  async getClientAccessRequests(): Promise<ClientAccessRequest[]> {
    return firstValueFrom(
      this.http.get<ClientAccessRequest[]>(`${this.apiUrl}/client-access-requests`)
    );
  }

  async verifyClientAccess(token: string) {
    return firstValueFrom(
      this.http.post<{
        refreshToken: string;
      }>(`${this.apiUrl}/verify-client-access`, { token }, { observe: 'response' })
    );
  }

  async requestClientAccess(payload: {
    email: string;
    reportUuid?: string;
    clientUuid?: string;
  }) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(
        `${this.apiUrl}/request-client-access`,
        payload,
        { observe: 'response' }
      )
    );
  }

}
