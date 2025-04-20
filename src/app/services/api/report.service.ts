import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { Client } from './client.service';
export interface ReportStatsResponse {
    bestAds: BestAd[]
    KPIs: Kpis
    campaigns: Campaign[]
    graphs: Graph[]
  }
  
  export interface BestAd {
    adCreativeId: string
    thumbnailUrl: string
    spend: string
    addToCart: string
    purchases: string
    roas: string
    sourceUrl: string
  }
  
  export interface Kpis {
    accountName: string
    accountId: string
    spend: string
    impressions: string
    clicks: string
    cpc: string
    ctr: string
    purchases: string
    costPerPurchase: string
    conversionValue: string
    addToCart: string
    costPerAddToCart: string
    initiatedCheckouts: string
    purchaseRoas: string
  }
  
  export interface Campaign {
    campaignName: string
    spend: string
    purchases: string
    conversionRate: string
    purchaseRoas: string
  }
  
  export interface Graph {
    accountName: string
    accountId: string
    spend: string
    impressions: string
    clicks: string
    cpc: string
    ctr: string
    purchases: string
    costPerPurchase: string
    conversionValue: string
    addToCart: string
    costPerAddToCart: string
    initiatedCheckouts: string
    purchaseRoas: string
    date: string
  }
  
export interface Report {
  uuid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  client: Client;
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

  async getReportStats(datePreset: string): Promise<ReportStatsResponse> {
    return firstValueFrom(this.http.get<ReportStatsResponse>(`${this.apiUrl}/reports?datePreset=${datePreset}&organizationName=test`, {headers: this.headers}));
  }

  async getWeeklyReportById(id: string): Promise<ReportStatsResponse> {
    return firstValueFrom(this.http.get<ReportStatsResponse>(`${this.apiUrl}/reports/${id}`, {headers: this.headers}));
  }

  async getClientReports(clientUuid: string): Promise<Report[]> {
    return firstValueFrom(this.http.get<Report[]>(`${this.apiUrl}/reports/client/${clientUuid}`, {headers: this.headers}));
  }
}