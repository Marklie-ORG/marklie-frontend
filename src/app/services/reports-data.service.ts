import {inject, Injectable} from '@angular/core';
import {GetAvailableMetricsResponse, Metrics, ReportService} from './api/report.service';
import {MetricSectionKey, ReportSection} from '../pages/schedule-report/schedule-report.component';
import {SchedulingOption} from '../pages/edit-report/edit-report.component';
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {SchedulesService} from "./api/schedules.service.js";

@Injectable({
  providedIn: 'root'
})
export class ReportsDataService {
  private schedulesService = inject(SchedulesService);
  readonly chartConfigs = [
    { key: 'spend', label: 'Daily Spend', color: '#1F8DED', format: (v: any) => `$${v}` },
    { key: 'purchaseRoas', label: 'ROAS', color: '#2ecc71', format: (v: any) => `${v}x` },
    { key: 'conversionValue', label: 'Conversion Value', color: '#c0392b', format: (v: any) => `$${v}` },
    { key: 'purchases', label: 'Purchases', color: '#e74c3c', format: (v: any) => `${v}` },
    { key: 'addToCart', label: 'Add to Cart', color: '#f1c40f', format: (v: any) => `${v}` },
    { key: 'initiatedCheckouts', label: 'Checkouts', color: '#9b59b6', format: (v: any) => `${v}` },
    { key: 'clicks', label: 'Clicks', color: '#e67e22', format: (v: any) => `${v}` },
    { key: 'impressions', label: 'Impressions', color: '#1abc9c', format: (v: any) => `${v}` },
    { key: 'ctr', label: 'CTR', color: '#34495e', format: (v: any) => `${v}%` },
    { key: 'cpc', label: 'CPC', color: '#16a085', format: (v: any) => `$${v}` },
    { key: 'costPerPurchase', label: 'Cost Per Purchase', color: '#8e44ad', format: (v: any) => `$${v}` },
    { key: 'costPerCart', label: 'Cost Per Add to Cart', color: '#d35400', format: (v: any) => `$${v}` }
  ];

  availableMetrics: GetAvailableMetricsResponse = {};

  readonly DATE_PRESETS = [
    { value: 'today', text: 'Today' },
    { value: 'yesterday', text: 'Yesterday' },
    { value: 'this_month', text: 'This Month' },
    { value: 'last_month', text: 'Last Month' },
    { value: 'this_quarter', text: 'This Quarter' },
    { value: 'last_3d', text: 'Last 3 Days' },
    { value: 'last_7d', text: 'Last 7 Days' },
    { value: 'last_14d', text: 'Last 14 Days' },
    { value: 'last_28d', text: 'Last 28 Days' },
    { value: 'last_30d', text: 'Last 30 Days' },
    { value: 'last_90d', text: 'Last 90 Days' },
    { value: 'last_week_mon_sun', text: 'Last Week (Mon-Sun)' },
    { value: 'last_week_sun_sat', text: 'Last Week (Sun-Sat)' },
    { value: 'last_quarter', text: 'Last Quarter' },
    { value: 'last_year', text: 'Last Year' },
    { value: 'this_week_mon_today', text: 'This Week (Mon-Today)' },
    { value: 'this_week_sun_today', text: 'This Week (Sun-Today)' },
    { value: 'this_year', text: 'This Year' },
    { value: 'maximum', text: 'Maximum' }
  ];
  readonly DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  getChartConfigs() {
    return this.chartConfigs;
  }

  async getInitiatedReportsSections(
    availableMetrics?: GetAvailableMetricsResponse,
    schedulingOption?: SchedulingOption
  ): Promise<ReportSection[]> {

    if (!availableMetrics) {
      availableMetrics = await this.schedulesService.getAvailableMetrics();
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

    return [
      {
        key: 'kpis',
        title: 'Main KPIs',
        enabled: true,
        metrics: initMetric('kpis'),
        order: schedulingOption ? schedulingOption.jobData.metrics.kpis.order : 1
      },
      {
        key: 'graphs',
        title: 'Graphs',
        enabled: true,
        metrics: initMetric('graphs'),
        order: schedulingOption ? schedulingOption.jobData.metrics.graphs.order : 2
      },
      {
        key: 'ads',
        title: 'Best creatives',
        enabled: true,
        metrics: initMetric('ads'),
        order: schedulingOption ? schedulingOption.jobData.metrics.ads.order : 3
      },
      {
        key: 'campaigns',
        title: 'Best campaigns',
        enabled: true,
        metrics: initMetric('campaigns'),
        order: schedulingOption ? schedulingOption.jobData.metrics.campaigns.order : 4
      }
    ];
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

  getDateRangeLabel(graphs: any[]): string {
    if (!graphs.length) return '';
    const start = new Date(graphs[0].date_start);
    const end = new Date(graphs.at(-1)?.date_stop || graphs.at(-1)?.date_start);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()} (${diffDays} days)`;
  }


  aggregateReports(data: any[]): any {
    const mergedKPIs: any = {};
    const mergedGraphs: any[] = [];
    const mergedCampaigns: any[] = [];
    const mergedAds: any[] = [];

    const kpiKeys = Object.keys(data[0]?.KPIs || {});
    for (const key of kpiKeys) {
      const total = data.reduce((sum, d) => sum + parseFloat(d.KPIs[key] || 0), 0);
      mergedKPIs[key] = (total / data.length).toFixed(2);
    }

    const graphLength = data[0]?.graphs.length || 0;
    for (let i = 0; i < graphLength; i++) {
      const entry = { ...data[0].graphs[i] };
      for (const key of Object.keys(entry)) {
        if (key === 'date_start' || key === 'date_stop') continue;
        const avg = data.reduce((sum, d) => sum + parseFloat(d.graphs[i]?.[key] || 0), 0) / data.length;
        entry[key] = avg.toFixed(2);
      }
      mergedGraphs.push(entry);
    }

    mergedCampaigns.push(...data.flatMap(d => d.campaigns || []));
    mergedAds.push(...data.flatMap(d => d.ads || []).sort((a, b) => Number(b.purchases) - Number(a.purchases)).slice(0, 10));

    return { KPIs: mergedKPIs, graphs: mergedGraphs, campaigns: mergedCampaigns, ads: mergedAds };
  }

  formatMetricLabel(metric: string): string {
    return metric
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase());
  }

  formatMetricValue(metric: string, value: any): string {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return value ?? '—';

    const rounded = num.toFixed(2);
    if (['spend', 'cpc'].includes(metric)) return `$${rounded}`;
    if (metric.includes('ctr')) return `${rounded}%`;
    if (metric.includes('roas')) return `${rounded}x`;
    return Number(num).toLocaleString();
  }

  renderCharts(graphs: any[], chartStore: Record<string, Chart>, dateLabel: string, prefix = '') {
    const labels = graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.getChartConfigs()) {
      const canvasId = `${prefix}_${config.key}_Chart`;

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) continue;

      const hasData = graphs.some(g => g[config.key] !== undefined && g[config.key] !== null);
      if (!hasData) {
        if (canvas) {
          canvas.style.display = 'none';
        }
        continue;
      }



      const data = graphs.map(g => parseFloat(g[config.key] ?? 0));

      const existingChart = Chart.getChart(canvasId);
      if (existingChart) {
        existingChart.destroy();
      }

      chartStore[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: config.label,
            data,
            borderColor: config.color,
            pointBackgroundColor: config.color,
            tension: 0.3,
            pointRadius: 3,
            fill: false,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${config.label} (${dateLabel})`,
              font: { size: 16 },
            },
            datalabels: { display: false },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value => config.format(Number(value).toFixed(0))
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  }

}
