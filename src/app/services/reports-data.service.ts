import { Injectable } from '@angular/core';
import { GetAvailableMetricsResponse, ReportService } from './api/report.service';
import { ReportSection } from '../pages/schedule-report/schedule-report.component';

@Injectable({
  providedIn: 'root'
})
export class ReportsDataService {

  availableMetrics: GetAvailableMetricsResponse = {};

  constructor(
    private reportService: ReportService
  ) { 
    
  }

  async getInitiatedReportsSections(availableMetrics?: GetAvailableMetricsResponse): Promise<ReportSection[]> {
    if (!availableMetrics) {
      availableMetrics = await this.reportService.getAvailableMetrics();
    }

    const initMetric = (metrics: string[]) => metrics.map((m, i) => ({ name: m, order: i + 1, enabled: false }));

    const reportSections: ReportSection[] = [
      { 
        key: 'kpis', 
        title: 'KPIs', 
        enabled: true, 
        metrics: initMetric(availableMetrics.kpis), 
        order: 1 
      },
      { 
        key: 'graphs', 
        title: 'Graphs', 
        enabled: true, 
        metrics: initMetric(availableMetrics.graphs), 
        order: 2 
      },
      { 
        key: 'ads', 
        title: 'Ads', 
        enabled: true, 
        metrics: initMetric(availableMetrics.ads), 
        order: 3 },
      { 
        key: 'campaigns', 
        title: 'Campaigns', 
        enabled: true, 
        metrics: initMetric(availableMetrics.campaigns), 
        order: 4 
      }
    ];

    return reportSections;
  }

}
