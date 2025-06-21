import { Injectable } from '@angular/core';
import { GetAvailableMetricsResponse, ReportService } from './api/report.service';
import { ReportSection } from '../pages/schedule-report/schedule-report.component';
import { SchedulingOption } from '../pages/edit-report/edit-report.component';

@Injectable({
  providedIn: 'root'
})
export class ReportsDataService {

  availableMetrics: GetAvailableMetricsResponse = {};

  constructor(
    private reportService: ReportService
  ) { 
    
  }

  async getInitiatedReportsSections(
    availableMetrics?: GetAvailableMetricsResponse,
    schedulingOption?: SchedulingOption
  ): Promise<ReportSection[]> { 

    if (!availableMetrics) {
      availableMetrics = await this.reportService.getAvailableMetrics();
    }

    

    const initMetric = (key: string) => {
      if (!availableMetrics) return [];
      
      const metrics = availableMetrics[key] || [];

      if (!schedulingOption) {
        return metrics.map((m, i) => ({ name: m, order: i, enabled: false }));
      }

      return metrics.map((metric, i) => {
        const metricIndex = schedulingOption.jobData.metrics[key].metrics.findIndex(m => m.name === metric);
        let order = metricIndex === -1 ? i : metricIndex;
        return { name: metric, order: order, enabled: false }
      })
      
    }

    // section.metrics.forEach(metric => {
      //   const metricIndex = schedulingOption.jobData.metrics[section.key].metrics.findIndex(m => m.name === metric.name);
      //   metric.order = metricIndex;
      // });

    const reportSections: ReportSection[] = [
      { 
        key: 'kpis', 
        title: 'KPIs', 
        enabled: true, 
        metrics: initMetric('kpis'), 
        order: schedulingOption ?  schedulingOption.jobData.metrics.kpis.order : 1
      },
      { 
        key: 'graphs', 
        title: 'Graphs', 
        enabled: true, 
        metrics: initMetric('graphs'), 
        order: schedulingOption ?  schedulingOption.jobData.metrics.graphs.order : 2 
      },
      { 
        key: 'ads', 
        title: 'Ads', 
        enabled: true, 
        metrics: initMetric('ads'), 
        order: schedulingOption ?  schedulingOption.jobData.metrics.ads.order : 3 
      },
      { 
        key: 'campaigns', 
        title: 'Campaigns', 
        enabled: true, 
        metrics: initMetric('campaigns'), 
        order: schedulingOption ?  schedulingOption.jobData.metrics.campaigns.order : 4 
      }
    ];

    return reportSections;
  }

}
