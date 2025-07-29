import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import { ScheduledReport } from 'src/app/pages/client/client.component';
import { CreateScheduleRequest, GetReportResponse, ReportImages } from 'src/app/interfaces/interfaces';


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
      return firstValueFrom(this.http.post(`${this.apiUrl}/scheduling-options/schedule`, data));
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

  async updateReportMetricsSelections(uuid: string, metricsSelections: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-metrics-selections/${uuid}`, metricsSelections, {headers: this.headers}));
  }

  async updateReportImages(uuid: string, images: ReportImages): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-images/${uuid}`, images, {headers: this.headers}));
  }
}

