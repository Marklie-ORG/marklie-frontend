import { Injectable } from '@angular/core';
import { GetAvailableMetricsResponse, Metrics, ReportService } from './api/report.service';
import { MetricSectionKey, ReportSection } from '../pages/schedule-report/schedule-report.component';
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

  MetricsSelectionsToReportSections(
    metricsSelections: any,
    availableMetrics: GetAvailableMetricsResponse,
    includeDisabledMetrics: boolean = true
  ): ReportSection[] {
    const transformedOutput: ReportSection[] = [];

    // Get the keys (category names) from the metricsSelections input to process them.
    for (const categoryKey in metricsSelections) {
        if (Object.prototype.hasOwnProperty.call(metricsSelections, categoryKey)) {
            let allMetricsForCategory: any[] = [];
            const sourceCategory = metricsSelections[categoryKey];
            const referenceMetricNames = availableMetrics[categoryKey] || []; // Get reference metrics for this category

            // Create a Set for quick lookup of metrics already present in the source.
            const sourceMetricNames = new Set(sourceCategory.metrics.map((m: any) => m.name));

            // 1. Process enabled metrics from the source object
            // These retain their relative order (adjusted to 0-indexed)
            const enabledMetricsFromSource: any[] = sourceCategory.metrics.map((metric: any) => ({
                name: metric.name,
                order: metric.order - 1, // Adjust to 0-indexed order
                enabled: true
            }));

            // Sort the enabled metrics by their adjusted order to ensure correct sequence
            enabledMetricsFromSource.sort((a, b) => a.order - b.order);

            if (includeDisabledMetrics) {
              // 2. Process disabled metrics from the reference that are not in the source
              // These will be appended after the enabled ones
              const disabledMetricsFromReference: any[] = [];
              referenceMetricNames.forEach(refMetricName => {
                if (!sourceMetricNames.has(refMetricName)) {
                    disabledMetricsFromReference.push({
                        name: refMetricName,
                        order: -1, // Placeholder, will be reassigned sequentially
                        enabled: false
                    });
                  }
              });

              // Combine enabled and disabled metrics
              allMetricsForCategory = enabledMetricsFromSource.concat(disabledMetricsFromReference);
            } else {
              allMetricsForCategory = enabledMetricsFromSource;
            }

            

            // Re-assign sequential 0-indexed order for all metrics in the combined list
            allMetricsForCategory.forEach((metric, index) => {
                metric.order = index;
            });

            // Construct the transformed category object
            transformedOutput.push({
                key: categoryKey as MetricSectionKey,
                title: categoryKey,
                enabled: true, // Categories present in metricsSelections are always enabled
                metrics: allMetricsForCategory,
                order: sourceCategory.order // Use the order from the source category
            });
        }
    }

    // Sort the top-level categories by their 'order' property
    transformedOutput.sort((a, b) => a.order - b.order);

    return transformedOutput;
  }

  reportSectionsToMetricsSelections(reportSections: ReportSection[]): Metrics {
    const selections: Metrics = {
      kpis: {
        metrics: [],
        order: 1
      },
      graphs: {
        metrics: [],
        order: 2
      },
      ads: {
        metrics: [],
        order: 3
      },
      campaigns: {
        metrics: [],
        order: 4
      }
    };

    const reportSectionsCopy = JSON.parse(JSON.stringify(reportSections)) as ReportSection[];
    reportSectionsCopy.forEach(section => {
      if (section.enabled) {
        // selections[section.key].metrics = this.getSelected(this.metricSelections[section.key]);
        selections[section.key].order = section.order;

        selections[section.key].metrics = section.metrics.filter(m => m.enabled);
        selections[section.key].metrics.sort((a: any, b: any) => a.order - b.order);
        selections[section.key].metrics.forEach((m: any, index: number) => {
          m.order = index + 1;
          delete m.enabled;
        });

      }
    });

    return selections;
  }

}
