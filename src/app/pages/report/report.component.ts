import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../services/api/report.service.js';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
  KPIs!: any;
  graphs: any[] = [];
  campaigns: any[] = [];
  bestAds: any[] = [];
  objectKeys = Object.keys;
  reportStatsLoading = false;
  campaignColumnOrder = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];
  dateRangeLabel = '';
  private chartInstances: Record<string, Chart> = {};

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

  constructor(
    private reportService: ReportService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const reportUuid = this.route.snapshot.params['uuid'];
    if (reportUuid) {
      await this.loadReport(reportUuid);
    }
  }

  ngOnDestroy() {
    Object.values(this.chartInstances).forEach(chart => chart.destroy());
  }

  private async loadReport(reportUuid: string) {
    this.reportStatsLoading = true;

    try {
      const res = await this.reportService.getReport(reportUuid);
      this.KPIs = res.data[0].KPIs;
      this.graphs = res.data[0].graphs;

      if (this.graphs.length) {
        const start = new Date(this.graphs[0].date_start);
        const end = new Date(this.graphs[this.graphs.length - 1].date_stop || this.graphs[this.graphs.length - 1].date_start);

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to be inclusive

        this.dateRangeLabel = `${start.toLocaleDateString()} – ${end.toLocaleDateString()} (${diffDays} days)`;
      }

      console.log(this.dateRangeLabel);

      this.campaigns = res.data[0].campaigns;
      this.bestAds = res.data[0].ads;

      this.ref.detectChanges();

      setTimeout(() => {
        this.renderCharts();
      }, 0);

    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      this.reportStatsLoading = false;
    }
  }


  getAdValue(ad: any, key: string): any {
    return ad[key];
  }

  private renderCharts(): void {
    const labels = this.graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.chartConfigs) {
      console.log(`${config.key}Chart`);
      const canvasId = `${config.key}Chart`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        continue
      }
      const data = this.graphs.map(g => parseFloat(String(g[config.key as keyof any])) || 0);
      this.chartInstances[canvasId]?.destroy();

      this.chartInstances[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: config.label,
            data,
            borderColor: config.color,
            pointBackgroundColor: config.color,
            pointRadius: 3,
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${config.label} (${this.dateRangeLabel})`, // Add label here
              font: { size: 16, family: 'Inter Variable, sans-serif' }
            },
            tooltip: {
              callbacks: {
                label: ctx => config.format(ctx.parsed.y.toFixed(2))
              }
            },
            datalabels: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value => config.format(Number(value).toFixed(0)),
                font: { family: 'Inter Variable, sans-serif' }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { family: 'Inter Variable, sans-serif' } },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  }

  formatMetricLabel(metric: string): string {
    return metric
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase());
  }

  formatMetricValue(metric: string, value: any): string {
    console.log(metric, value)
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return value ?? '—';

    const rounded = num.toFixed(2);
    if (['spend', 'cpc'].includes(metric)) return `$${rounded}`;
    if (metric.includes('ctr')) return `${rounded}%`;
    if (metric.includes('roas')) return `${rounded}x`;
    return Number(num).toLocaleString();
  }

  getMetricStyle(metric: string): string {
    if (['purchase_roas', 'purchaseRoas', 'ctr'].includes(metric)) return 'success';
    if (['spend', 'cpc'].includes(metric)) return 'primary';
    return '';
  }
}
