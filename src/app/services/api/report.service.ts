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
  createSchedule(data: any) {
    try {
      console.log(this.apiUrl)
      return firstValueFrom(this.http.post(`${this.apiUrl}/reports/schedule`, data));

    }catch (e) {
      console.log(e)

    }
  }

  updateSchedule(scheduleUuid: string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiUrl}/reports/${scheduleUuid}`, data));
  }

  deleteSchedule(scheduleUuid: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/reports/${scheduleUuid}`));
  }

  async getReport(uuid: string): Promise<ReportStatsResponse> {
    return firstValueFrom(this.http.get<ReportStatsResponse>(`${this.apiUrl}/reports/${uuid}`, {headers: this.headers}));
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
}
