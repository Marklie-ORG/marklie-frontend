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

  async getClientsLogs(clientUuid: string) {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/${clientUuid}/logs`)
    );
  }

  async getIsSlackWorkspaceConnected(clientUuid: string) {
    return firstValueFrom(
      this.http.get<{
        isConnected: boolean;
      }>(`${this.apiUrl}/${clientUuid}/slack/is-workspace-connected`)
    );
  }

  async getSlackAvailableConversations(clientUuid: string) {
    return firstValueFrom(
      this.http.get<Conversations>(`${this.apiUrl}/${clientUuid}/slack/conversations`)
    );
  }

  async setSlackConversationId(clientUuid: string, conversationId: string) {
    return firstValueFrom(
      this.http.put<{
        message: string;
      }>(`${this.apiUrl}/${clientUuid}/slack/conversation-id`, { conversationId }, { observe: 'response' })
    );
  }

  async getConnectedWorkspaces(clientUuid: string) {
    return firstValueFrom(
      this.http.get<Workspace[]>(`${this.apiUrl}/${clientUuid}/slack/workspaces`)
    );
  }

  async setSlackWorkspaceToken(clientUuid: string, tokenId: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/${clientUuid}/slack/workspace-token`, { tokenId }, { observe: 'response' })
    );
  }

  async updateClient(clientUuid: string, client: UpdateClientRequest) {
    return firstValueFrom(
      this.http.put<{
        message: string;
      }>(`${this.apiUrl}/${clientUuid}`, client, { observe: 'response' })
    );
  }

}

export interface Workspace {
  clientName: string;
  clientId: string;
  tokenId: string;
  teamId: string;
  name: string;
  image: string;
}

export interface Conversations {
  channels: Channel[];
  ims: IM[];
}

interface Channel {
  id: string;
  name: string;
}

interface IM {
  id: string;
  name: string;
  image: string;
}



export interface Client {
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    organization: string;
    crons: any[]
    slackConversationId: string | null;
    emails: string[];
    phoneNumbers: string[];
    slack: string[];
    schedulingOption: any[];
}

export interface CreateClientRequest {
  name: string;
  facebookAdAccounts: string[];
  tiktokAdAccounts: string[];
}


export interface UpdateClientRequest {
  name?: string;
  emails?: string[];
  phoneNumbers?: string[];
}
