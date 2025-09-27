import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';
import { ScheduledReport } from 'src/app/pages/client/client.component';
import { ScheduleReportRequest, ReportImages, Provider, SendAfterReviewRequest, SendAfterReviewResponse, Messages, Metadata, UpdateReportMetadataRequest } from 'src/app/interfaces/interfaces';
import { GetReportResponse } from 'src/app/interfaces/get-report.interfaces';


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.reportsApiUrl}`;

  private headers = {
    'ngrok-skip-browser-warning': 'true'
  }

  constructor(private http: HttpClient) { }

  async scheduleReport(data: ScheduleReportRequest) {
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

  async getClientReports(clientUuid: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/reports/client/${clientUuid}`, {headers: this.headers}));
  }

  async getSchedulingOption(uuid: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/reports/scheduling-option/${uuid}`, {headers: this.headers}));
  }

  async updateReportData(uuid: string, data: Provider[]): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-data/${uuid}`, data, {headers: this.headers}));
  }

  async updateReportMetadata(uuid: string, metadata: UpdateReportMetadataRequest): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-metadata/${uuid}`, metadata, {headers: this.headers}));
  }

  // async updateReportImages(uuid: string, images: ReportImages): Promise<any> {
  //   return firstValueFrom(this.http.put<any>(`${this.apiUrl}/reports/report-images/${uuid}`, images, {headers: this.headers}));
  // }

  // async updateReportMessages(uuid: string, messages: Messages): Promise<{ message: string }> {
  //   return firstValueFrom(
  //     this.http.put<{ message: string }>(
  //       `${this.apiUrl}/reports/report-messages/${uuid}`,
  //       messages,
  //       { headers: this.headers }
  //     )
  //   );
  // }

  async sendAfterReview(data: SendAfterReviewRequest): Promise<SendAfterReviewResponse> {
    return firstValueFrom(
      this.http.post<SendAfterReviewResponse>(
        `${this.apiUrl}/reports/send-after-review`,
        data,
        { headers: this.headers }
      )
    );
  }

  async getPendingReviewCount(): Promise<number> {
    const res = await firstValueFrom(
      this.http.get<{ count: number }>(
        `${this.apiUrl}/reports/pending-review/count`,
        { headers: this.headers }
      )
    );
    return res.count;
  }

  // async updateReportTitle(uuid: string, reportName: string): Promise<any> {
  //   return firstValueFrom(
  //     this.http.put<any>(
  //       `${this.apiUrl}/reports/report-title/${uuid}`,
  //       { reportName },
  //       { headers: this.headers }
  //     )
  //   );
  // }

  async stopSchedulingOptions(uuids: string[]): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.put<{ message: string }>(
        `${this.apiUrl}/scheduling-options/stop`,
        { uuids },
        { headers: this.headers }
      )
    );
  }

  async deleteSchedulingOptions(uuids: string[]): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.put<{ message: string }>(
        `${this.apiUrl}/scheduling-options/delete`,
        { uuids },
        { headers: this.headers }
      )
    );
  }

  async activateSchedulingOptions(uuids: string[]): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.put<{ message: string }>(
        `${this.apiUrl}/scheduling-options/activate`,
        { uuids },
        { headers: this.headers }
      )
    );
  }

  async downloadReportPdf(uuid: string): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.apiUrl}/reports/${uuid}/pdf`, { headers: this.headers, responseType: 'blob' })
    );
  }
}

