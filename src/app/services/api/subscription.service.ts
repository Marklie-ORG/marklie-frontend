import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {firstValueFrom, Observable} from "rxjs";
import {environment} from "@env/environment.js";
import {SubscriptionPlan, SubscriptionResponse} from "../../pages/billing/billing.component.js";

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private http: HttpClient) {}
  private apiUrl = `${environment.authApiUrl}`;

  createSetupIntent() {
    return firstValueFrom(this.http.post<{ clientSecret: string }>(`${this.apiUrl}/subscriptions/setup-intent`, {}));
  }

  subscribe(body: { planId: string; paymentMethodId?: string; trialDays?: number }) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/subscriptions/subscribe`, body));
  }

  update(body: { planId: string; prorationBehavior?: string }) {
    return firstValueFrom(this.http.put(`${this.apiUrl}/subscriptions/update`, body));
  }

  resume() {
    return firstValueFrom(this.http.get(`${this.apiUrl}/subscriptions/resume`));
  }

  getPlans() {
    return firstValueFrom(this.http.get<SubscriptionPlan[]>(`${this.apiUrl}/subscriptions/plans`));
  }

  getCurrent() {
    return firstValueFrom(this.http.get<SubscriptionResponse>(`${this.apiUrl}/subscriptions/current`));
  }

  cancel(body: { immediately?: boolean }) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/subscriptions/cancel`, body))
  }

  finalize(sessionId: string) {
    return this.http.get(`/api/subscriptions/finalize`, { params: { session_id: sessionId } }).toPromise();
  }
}
