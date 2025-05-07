import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  async getClients() {
    return firstValueFrom(
      this.http.get<Client[]>(`${this.apiUrl}`)
    );
  }

  async createClient(client: CreateClientRequest) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/`, client)
    );
  }

  async getClient(clientUuid: string) {
    return firstValueFrom(
      this.http.get<Client>(`${this.apiUrl}/${clientUuid}`)
    );
  }

}

export interface Client {
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    organization: string;
  crons: any[]
}

export interface CreateClientRequest {
  name: string;
  facebookAdAccounts: string[];
  tiktokAdAccounts: string[];
}
