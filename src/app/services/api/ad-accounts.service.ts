import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

export type Root = Root2[]

export interface Root2 {
  id: string
  name: string
  owned_ad_accounts: OwnedAdAccount[]
  client_ad_accounts: ClientAdAccount[]
}

export interface OwnedAdAccount {
  id: string
  name: string
}

export interface ClientAdAccount {
  id: string
  name: string
}
  

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}`;
  // private apiUrl = 'https://0758-77-174-130-35.ngrok-free.app';

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  }

  constructor(private http: HttpClient) { }

  async getBusinesses(): Promise<Root> {
    return firstValueFrom(this.http.get<Root>(`${this.apiUrl}/ad-accounts/businesses?&organizationName=test`, {headers: this.headers}));
  }
}