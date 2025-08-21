import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

export type Root = Business[]

export interface Business {
  id: string
  name: string
  ad_accounts: AdAccount[]
}

export interface AdAccount {
  id: string
  name: string
  business: {
    id: string
    name: string
  }
}

export interface AdAccountCurrencyResponse {
  currency: string
}


@Injectable({
  providedIn: 'root'
})
export class AdAccountsService {
  private apiUrl = `${environment.apiUrl}`;

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  }

  constructor(private http: HttpClient) { }

  async getBusinessesHierarchy(): Promise<Root> {
    return firstValueFrom(this.http.get<Root>(`${this.apiUrl}/ad-accounts/businesses-hierarchy`, {headers: this.headers}));
  }

  async getAdAccountCurrency(adAccountId: string, organizationUuid: string): Promise<AdAccountCurrencyResponse> {
    return firstValueFrom(
      this.http.get<AdAccountCurrencyResponse>(
        `${this.apiUrl}/ad-accounts/currency`,
        {
          params: { adAccountId, organizationUuid },
          headers: this.headers
        }
      )
    );
  }
}
