import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../services/api/report.service.js';

@Component({
  selector: 'app-pdf-report',
  templateUrl: './pdf-report.component.html',
  styleUrls: ['./pdf-report.component.scss']
})
export class PdfReportComponent implements OnInit {
  KPIs!: any;
  graphs: any[] = [];
  campaigns: any[] = [];
  bestAds: any[] = [];
  objectKeys = Object.keys;
  reportStatsLoading = false;
  dateRangeLabel = '';
  base64Charts: { label: string, url: string }[] = [];

  campaignColumnOrder = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];

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

  private async loadReport(reportUuid: string) {
    this.reportStatsLoading = true;
    try {
      const res = await this.reportService.getReport(reportUuid);
      const data = res.data[0];

      this.KPIs = data.KPIs;
      this.graphs = data.graphs;
      this.campaigns = data.campaigns;
      this.bestAds = data.ads;

      if (this.graphs.length) {
        const start = new Date(this.graphs[0].date_start);
        const end = new Date(this.graphs.at(-1)?.date_stop || this.graphs.at(-1)?.date_start);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        this.dateRangeLabel = `${start.toLocaleDateString()} – ${end.toLocaleDateString()} (${diff} days)`;
      }

      this.ref.detectChanges();

      await this.renderChartsAsImages();
      this.ref.detectChanges();

    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      this.reportStatsLoading = false;
    }
  }

  private async renderChartsAsImages() {
    const labels = this.graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const cfg of this.chartConfigs) {
      const canvas = document.createElement('canvas');
      canvas.width = 600; // fixed width for rendering
      canvas.height = 300; // fixed height
      const ctx = canvas.getContext('2d');

      new Chart(ctx!, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: cfg.label,
            data: this.graphs.map(g => parseFloat(g[cfg.key]) || 0),
            borderColor: cfg.color,
            pointRadius: 3,
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: cfg.label,
              font: {
                size: 20,
                family: 'Arial'
              }
            },          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 18
                }
              },
              grid: { color: '#eee' }
            },
            y: {
              ticks: {
                callback: value => cfg.format(Number(value).toFixed(0)),
                font: {
                  size: 18
                }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          }
        }
      });

      await new Promise(r => setTimeout(r, 50));
      const base64 = canvas.toDataURL('image/png');
      this.base64Charts.push({label: "", url: base64 });    }
  }

  getAdValue(ad: any, key: string): any {
    return ad[key];
  }

  formatMetricLabel(metric: string): string {
    return metric.replace(/_/g, ' ')
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

  getMetricStyle(metric: string): string {
    if (['purchase_roas', 'purchaseRoas', 'ctr'].includes(metric)) return 'success';
    if (['spend', 'cpc'].includes(metric)) return 'primary';
    return '';
  }
}
