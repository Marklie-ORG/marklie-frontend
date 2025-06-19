import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import { Client } from './client.service.js';
export interface ReportStatsResponse {
  data: {
    ads: any[]
    KPIs: any
    campaigns: any[]
    graphs: any[]
    adAccountId: string
  }[]
}

export interface Report {
  uuid:	string
  cronExpression:	string
  isActive: boolean,
  nextRun:	Date
  dataPreset:	string
  reviewNeeded:	boolean
}

export interface CreateScheduleRequest extends Schedule {
  metrics: Metrics
  datePreset: string
  clientUuid: string
  timeZone: string
  messages: {
    whatsapp: string,
    slack: string,
    email: {
      title: string,
      body: string,
    }
  };
}

export interface Schedule {
  frequency: string
  time: string
  dayOfWeek: string
  dayOfMonth: number
  intervalDays: number
  cronExpression: string
  reviewNeeded: boolean
}

interface Metric {
  name: string
  order: number
}

export interface Metrics {
  kpis: string[]
  graphs: string[]
  ads: string[]
  campaigns: string[]
}

export interface GetReportResponse {
  uuid: string
  createdAt: string
  updatedAt: string
  organization: string
  client: string
  reportType: string
  gcsUrl: string
  data: Daum[]
  metadata: Metadata
}

export interface Daum {
  ads: Ad[]
  KPIs: Kpis
  graphs: Graph[]
  campaigns: Campaign[]
  adAccountId: string
}

export interface Ad {
  adId: string
  adCreativeId: string
  thumbnailUrl: string
  spend: string
  addToCart: string
  purchases: string
  roas: string
  sourceUrl: string
}
export interface Kpis {
  spend: string
  purchaseRoas: string
  conversionValue: string
  purchases: string
  impressions: string
  clicks: string
  cpc: string
  ctr: string
  costPerPurchase: number
  addToCart: string
  costPerAddToCart: number
  initiatedCheckouts: string
}

export interface Graph {
  spend: string
  impressions: number
  clicks: number
  ctr: string
  cpc: string
  purchaseRoas: string
  conversionValue: string
  engagement: number
  purchases: number
  costPerPurchase: string
  costPerCart: string
  addToCart: number
  initiatedCheckouts: number
  conversionRate: string
  date_start: string
  date_stop: string
}


export interface Campaign {
  index: number
  campaign_name: string
  spend: string
  purchases: number
  conversionRate: string
  purchaseRoas: string
}

export interface Metadata {
  datePreset: string
  reviewNeeded: boolean
}


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.reportsApiUrl}`;
  // private apiUrl = 'https://0758-77-174-130-35.ngrok-free.app';

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  }

  constructor(private http: HttpClient) { }

  // @ts-ignore
  createSchedule(data: CreateScheduleRequest) {
    try {
      console.log(this.apiUrl)
      return firstValueFrom(this.http.post(`${this.apiUrl}/reports/schedule`, data));

    }catch (e) {
      console.log(e)

    }
  }

  updateSchedulingOption(scheduleUuid: string, data: CreateScheduleRequest): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiUrl}/reports/scheduling-option/${scheduleUuid}`, data));
  }

  deleteSchedule(scheduleUuid: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/reports/${scheduleUuid}`));
  }

  async getReport(uuid: string): Promise<GetReportResponse> {
    return firstValueFrom(this.http.get<GetReportResponse>(`${this.apiUrl}/reports/${uuid}`, {headers: this.headers}));
  }

  async getReportStats(datePreset: string): Promise<ReportStatsResponse> {
    return firstValueFrom(this.http.get<ReportStatsResponse>(`${this.apiUrl}/reports?datePreset=${datePreset}&organizationName=test`, {headers: this.headers}));
  }

  async getWeeklyReportById(id: string): Promise<ReportStatsResponse> {
    return firstValueFrom(this.http.get<ReportStatsResponse>(`${this.apiUrl}/reports/${id}`, {headers: this.headers}));
  }

  async getClientReports(clientUuid: string): Promise<Report[]> {
    return firstValueFrom(this.http.get<Report[]>(`${this.apiUrl}/reports/client/${clientUuid}`, {headers: this.headers}));
  }

  async getSchedulingOption(uuid: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/reports/scheduling-option/${uuid}`, {headers: this.headers}));
  }

  async getAvailableMetrics(): Promise<Metrics> {
    return firstValueFrom(this.http.get<Metrics>(`${this.apiUrl}/reports/available-metrics`));
  }
}

