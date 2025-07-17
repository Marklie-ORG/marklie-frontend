import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import {ScheduledReport} from "../../pages/client/client.component.js";
import {CreateScheduleRequest, GetAvailableMetricsResponse} from "./report.service.js";


@Injectable({
  providedIn: 'root'
})
export class SchedulesService {
  private apiUrl = `${environment.reportsApiUrl}/scheduling-options`;

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  }

  constructor(private http: HttpClient) { }


  updateSchedulingOption(scheduleUuid: string, data: CreateScheduleRequest): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiUrl}/${scheduleUuid}`, data));
  }

  deleteSchedule(scheduleUuid: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${scheduleUuid}`));
  }

  async getSchedulingOptions(clientUuid: string) {
    return firstValueFrom(this.http.get<ScheduledReport[]>(`${this.apiUrl}/client/${clientUuid}`, {headers: this.headers}));
  }


  async getSchedulingOption(uuid: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/${uuid}`, {headers: this.headers}));
  }

  async getAvailableMetrics(): Promise<GetAvailableMetricsResponse> {
    return firstValueFrom(this.http.get<GetAvailableMetricsResponse>(`${this.apiUrl}/available-metrics`));
  }

  async updateReportMetricsSelections(uuid: string, metricsSelections: any): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/report-metrics-selections/${uuid}`, metricsSelections, {headers: this.headers}));
  }
}

