import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {ActivatedRoute, Router} from "@angular/router";
import {ReportService} from "../../services/api/report.service.js";

type MetricSectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

interface ReportSection {
  key: MetricSectionKey;
  title: string;
  enabled: boolean;
  metrics: string[];
}

@Component({
  selector: 'mock-report',
  templateUrl: './mock-report.component.html',
  styleUrls: ['./mock-report.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('250ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-out', style({ opacity: 0 }))])
    ])
  ]
})
export class MockReportComponent implements OnInit, AfterViewInit {
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
  DEFAULT_SELECTED_METRICS = ['spend', 'impressions', 'clicks'];
  readonly DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  readonly DAYS_IN_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

  schedule = {
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 'Monday',
    dayOfMonth: 1,
    intervalDays: 1,
    cronExpression: '',
    reviewNeeded: false,
  };
  clientUuid: string = '';
  reportStatsLoading = true;

  availableMetrics = ['spend', 'impressions', 'clicks', 'cpc', 'ctr', 'actions', 'action_values', 'purchase_roas', 'reach'];
  availableGraphMetrics = ['spend', 'impressions', 'clicks', 'cpc', 'ctr', 'purchaseRoas', 'conversionValue', 'purchases', 'addToCart', 'initiatedCheckouts', 'costPerPurchase', 'costPerCart'];
  adAvailableMetrics = ['spend', 'addToCart', 'purchases', 'roas'];
  campaignAvailableMetrics = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];

  selectedDatePresetText = this.DATE_PRESETS[6].value;

  metricSelections = {
    kpis: {} as Record<string, boolean>,
    graphs: {} as Record<string, boolean>,
    ads: {} as Record<string, boolean>,
    campaigns: {} as Record<string, boolean>
  };

  panelToggles = {
    kpis: true,
    graphs: true,
    ads: true,
    campaigns: true
  };

  adMetrics: string[] = [];
  campaignMetrics: string[] = [];
  metricsGraphConfig: any[] = [];

  KPIs: Record<string, any> = {};
  ads: any[] = [];
  campaigns: any[] = [];
  graphs: any[] = [];

  scheduleSaved = false;

  constructor(
    private reportsService: ReportService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  private chartRefs: Record<string, Chart> = {};
  campaignColumnOrder: string[] = [...this.campaignAvailableMetrics];

  reportSections: ReportSection[] = [
    { key: 'kpis', title: 'KPIs', enabled: true, metrics: this.availableMetrics },
    { key: 'graphs', title: 'Graphs', enabled: true, metrics: this.availableGraphMetrics },
    { key: 'ads', title: 'Ads', enabled: true, metrics: this.adAvailableMetrics },
    { key: 'campaigns', title: 'Campaigns', enabled: true, metrics: this.campaignAvailableMetrics }
  ];

  ngOnInit(): void {
    this.clientUuid = this.route.snapshot.paramMap.get('clientUuid') || '';

    this.initMetricSelections();
    this.generateMockData();
    this.updateVisibleMetrics();
    this.reportStatsLoading = false;
  }

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  private initMetricSelections(): void {
    const initSelection = (keys: string[]) => keys.reduce((acc, k) => ({ ...acc, [k]: this.DEFAULT_SELECTED_METRICS.includes(k) }), {});
    this.metricSelections = {
      kpis: initSelection(this.availableMetrics),
      graphs: initSelection(this.availableGraphMetrics),
      ads: initSelection(this.adAvailableMetrics),
      campaigns: initSelection(this.campaignAvailableMetrics)
    };
  }

  private generateMockData(): void {
    this.KPIs = this.mockKPIs();
    this.ads = this.mockAds();
    this.campaigns = this.mockCampaigns();
    this.graphs = this.mockGraphData();
  }

  onPanelToggleChange(): void {
    this.updateVisibleMetrics();
  }

  onMetricSelectionChange(): void {
    this.updateVisibleMetrics();
  }


  private updateVisibleMetrics(): void {
    const { kpis, graphs, ads, campaigns } = this.metricSelections;

    this.DEFAULT_SELECTED_METRICS = this.getSelected(kpis);
    this.metricsGraphConfig = this.getMetricConfigs().filter(cfg => graphs[cfg.key]);
    this.adMetrics = this.getSelected(ads);
    this.campaignMetrics = this.getSelected(campaigns);

    if (this.panelToggles.graphs) {
      setTimeout(() => this.renderCharts(), 0);
    }
  }

  private getSelected(selection: Record<string, boolean>): string[] {
    return Object.keys(selection).filter(k => selection[k]);
  }

  dropSection(event: CdkDragDrop<ReportSection[]>): void {
    moveItemInArray(this.reportSections, event.previousIndex, event.currentIndex);
  }

  dropMetric(event: CdkDragDrop<string[]>, sectionIndex: number): void {
    const section = this.reportSections[sectionIndex];
    if (event.previousContainer === event.container) {
      moveItemInArray(section.metrics, event.previousIndex, event.currentIndex);
    } else {
      const from = this.reportSections.findIndex(s => s.metrics === event.previousContainer.data);
      if (from !== -1) {
        transferArrayItem(this.reportSections[from].metrics, section.metrics, event.previousIndex, event.currentIndex);
      }
    }
  }

  dropKPICard(event: CdkDragDrop<string[]>): void {
    const kpiSection = this.reportSections.find(s => s.key === 'kpis');
    if (kpiSection) {
      moveItemInArray(kpiSection.metrics, event.previousIndex, event.currentIndex);
      this.updateVisibleMetrics();
    }
  }

  dropGraphCard(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.metricsGraphConfig, event.previousIndex, event.currentIndex);
    setTimeout(() => this.renderCharts(), 100);
  }

  dropCampaignColumn(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.campaignColumnOrder, event.previousIndex, event.currentIndex);
  }

  async saveConfiguration() {
    const metrics: Partial<Record<MetricSectionKey, string[]>> = {};

    (Object.keys(this.panelToggles) as MetricSectionKey[]).forEach(sectionKey => {
      if (this.panelToggles[sectionKey]) {
        metrics[sectionKey] = this.getSelected(this.metricSelections[sectionKey]);
      }
    });

    const payload = {
      ...(this.schedule),
      metrics,
      dataPreset: this.selectedDatePresetText,
      clientUuid: this.clientUuid,
    };

    try {
      await this.reportsService.createSchedule(payload);
      this.scheduleSaved = true;
      setTimeout(() => this.scheduleSaved = false, 3000);
      this.router.navigate(['/client', this.clientUuid]);
    } catch (e) {
      console.error(e);
    }
  }

  private renderCharts(): void {
    if (!this.graphs?.length) return;

    const labels = this.graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.metricsGraphConfig) {
      const canvasId = `${config.key}Chart`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) continue;

      const data = this.graphs.map(g => parseFloat(g[config.key]) || 0);

      this.chartRefs[canvasId]?.destroy();

      this.chartRefs[canvasId] = new Chart(canvas, {
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
              text: config.label,
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

  getMetricConfigs() {
    return [
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


  getMetricStyle(metric: string): string {
    if (['purchase_roas', 'purchaseRoas', 'ctr'].includes(metric)) return 'success';
    if (['spend', 'cpc'].includes(metric)) return 'primary';
    return '';
  }

  private mockKPIs() {
    return {
      spend: 1234.56,
      impressions: 145000,
      clicks: 3123,
      cpc: 0.58,
      ctr: 2.3,
      actions: 9876,
      action_values: 11340,
      purchase_roas: 3.12,
      reach: 89000
    };
  }

  private mockAds() {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: `ad-${i + 1}`,
      name: `Ad Creative #${i + 1}`,
      thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
      spend: +(Math.random() * 500).toFixed(2),
      addToCart: Math.floor(Math.random() * 150),
      purchases: Math.floor(Math.random() * 80),
      roas: +(Math.random() * 5).toFixed(2),
      sourceUrl: `https://facebook.com/ads/${i + 1}`
    }));
  }

  private mockCampaigns() {
    return Array.from({ length: 5 }).map((_, i) => {
      const base = {
        campaign_id: `camp-${i + 1}`,
        campaign_name: `Campaign ${i + 1}`
      };

      const metrics = this.campaignAvailableMetrics.reduce((acc, metric) => {
        const isCurrency = ['spend'].includes(metric.toLowerCase());
        const isPercent = metric.toLowerCase().includes('rate');
        const isRoas = metric.toLowerCase().includes('roas');
        const isInt = ['purchases', 'conversions'].includes(metric.toLowerCase());

        let value = isInt ? Math.floor(Math.random() * 200)
          : isPercent || isRoas ? +(Math.random() * 5).toFixed(2)
            : isCurrency ? +(Math.random() * 1500).toFixed(2)
              : +(Math.random() * 100).toFixed(2);

        acc[metric] = value;
        return acc;
      }, {} as Record<string, number>);

      return { ...base, ...metrics };
    });
  }

  private mockGraphData() {
    const today = new Date();
    return Array.from({ length: 10 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (10 - i));
      return {
        date_start: d.toISOString(),
        spend: (Math.random() * 300).toFixed(2),
        purchaseRoas: (Math.random() * 5).toFixed(2),
        conversionValue: (Math.random() * 2000).toFixed(2),
        purchases: Math.floor(Math.random() * 50),
        addToCart: Math.floor(Math.random() * 100),
        initiatedCheckouts: Math.floor(Math.random() * 80),
        clicks: Math.floor(Math.random() * 500),
        impressions: Math.floor(Math.random() * 5000),
        ctr: (Math.random() * 5).toFixed(2),
        cpc: (Math.random() * 2).toFixed(2),
        costPerPurchase: (Math.random() * 100).toFixed(2),
        costPerCart: (Math.random() * 20).toFixed(2)
      };
    });
  }
}
