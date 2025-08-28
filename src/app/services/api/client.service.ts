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

  async getSlackAvailableConversations(clientUuid: string) { // todo: uncomment here
    return firstValueFrom(
      this.http.get<Conversations>(`${this.apiUrl}/${clientUuid}/slack/conversations`)
    );
    return {
      "channels": [
          {
              "id": "C08PMRJJ5MJ",
              "name": "new-channel"
          },
          {
              "id": "C08Q6UXTK6C",
              "name": "all-test"
          },
          {
              "id": "C08Q6UXUQL8",
              "name": "social"
          },
          {
              "id": "C08UMRNH1D5",
              "name": "hq-channel"
          },
          {
              "id": "C08V3H9NFQC",
              "name": "team-channel"
          }
      ],
      "ims": [
          {
              "id": "USLACKBOT",
              "name": "Slackbot",
              "image": "https://a.slack-edge.com/80588/img/slackbot_48.png"
          },
          {
              "id": "U08PMDJDUSE",
              "name": "Oleksii",
              "image": "https://secure.gravatar.com/avatar/ec1a41a197610931a4d99a1a977b251d.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0018-48.png"
          },
          {
              "id": "U08PN5X5AG4",
              "name": "Marklie",
              "image": "https://avatars.slack-edge.com/2025-04-30/8824534072693_08fe5b91b4f3096398f4_48.png"
          },
          {
              "id": "U08Q6UXN656",
              "name": "derevyanko.andrew2004",
              "image": "https://avatars.slack-edge.com/2025-04-24/8803583886659_3e1330dd8a7dafd75c08_48.png"
          },
          {
              "id": "U0965EGL2H4",
              "name": "Roman Pchelintsev",
              "image": "https://avatars.slack-edge.com/2025-07-17/9207303726531_575016386f6074a616d7_48.png"
          }
      ]
  }
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

  async deleteClient(clientUuid: string) {
    return firstValueFrom(
      this.http.delete(`${this.apiUrl}/${clientUuid}`, { responseType: 'text' })
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

export interface Client { // wef
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    organization: string;
    crons: any[]
    slackConversationId: string | null;
    emails: string[];
    phoneNumbers: string[];
    slack: string;
    schedulingOption: any[];
    adAccounts: {adAccountId: string, adAccountName: string, businessId: string}[];
    facebookAdAccounts?: {adAccountId: string, adAccountName: string, businessId: string}[];
    schedulesCount: number;
    lastActivity?: string;
}

export interface CreateClientRequest {
  name: string;
  facebookAdAccounts: {adAccountId: string, adAccountName: string, businessId: string}[];
  emails: string[];
  phoneNumbers: string[];
}


export interface UpdateClientRequest {
  name?: string;
  facebookAdAccounts?: {adAccountId: string, adAccountName: string, businessId: string}[];
  emails?: string[];
  phoneNumbers?: string[];
}
