import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import { ScheduledReport } from 'src/app/pages/client/client.component';

export interface GetAvailableMetricsResponse {
  [key: string]: string[]
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
  reportName: string
  timeZone: string
  messages: {
    whatsapp: string,
    slack: string,
    email: {
      title: string,
      body: string,
    }
  };
  images: {
    clientLogo: string,
    organizationLogo: string
  }
}

export interface Schedule {
  frequency: string
  reportName: string
  time: string
  dayOfWeek: string
  dayOfMonth: number
  intervalDays: number
  cronExpression: string
  reviewNeeded: boolean
}

export interface Metric {
  name: string
  order: number
  enabled?: boolean
}

export interface Metrics {
  [key: string]: {
    metrics: Metric[],
    order: number
  }
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
  images?: {
    clientLogo: string
    agencyLogo: string
  }
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
  metricsSelections: any
  reportName: string
  images?: {
    clientLogo: string
    agencyLogo: string
  }
}

export interface ReportImages {
  clientLogo: string
  agencyLogo: string
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.reportsApiUrl}`;

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  }

  constructor(private http: HttpClient) { }

  async createSchedule(data: CreateScheduleRequest) {
      return firstValueFrom(this.http.post(`${this.apiUrl}/reports/schedule`, data));
  }

  async getReport(uuid: string): Promise<GetReportResponse> {
    return firstValueFrom(this.http.get<GetReportResponse>(`${this.apiUrl}/reports/${uuid}`, {headers: this.headers}));
  }

  async getSchedulingOptions(clientUuid: string) {
    return firstValueFrom(this.http.get<ScheduledReport[]>(`${this.apiUrl}/reports/scheduling-options/${clientUuid}`, {headers: this.headers}));
  }

  async getReports(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/reports/`, {headers: this.headers}));
  }

  async getClientReports(clientUuid: string): Promise<Report[]> {
    return firstValueFrom(this.http.get<Report[]>(`${this.apiUrl}/reports/client/${clientUuid}`, {headers: this.headers}));
  }

  async getSchedulingOption(uuid: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/reports/scheduling-option/${uuid}`, {headers: this.headers}));
  }

  async getAvailableMetrics(): Promise<GetAvailableMetricsResponse> {
    return firstValueFrom(this.http.get<GetAvailableMetricsResponse>(`${this.apiUrl}/reports/available-metrics`));
  }

  async updateReportMetricsSelections(uuid: string, metricsSelections: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-metrics-selections/${uuid}`, metricsSelections, {headers: this.headers}));
  }

  async updateReportImages(uuid: string, images: ReportImages): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-images/${uuid}`, images, {headers: this.headers}));
  }
}

