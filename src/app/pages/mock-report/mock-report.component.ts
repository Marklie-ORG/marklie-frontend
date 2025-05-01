import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'mock-report',
  templateUrl: './mock-report.component.html',
  styleUrls: ['./mock-report.component.scss']
})
export class MockReportComponent implements OnInit, AfterViewInit {
  schedule = { frequency: 'weekly', time: '09:00' };
  metricSelections = {
    kpis: {} as Record<string, boolean>,
    graphs: {} as Record<string, boolean>,
    ads: {} as Record<string, boolean>,
    campaigns: {} as Record<string, boolean>
  };

  adAvailableMetrics = ['spend', 'addToCart', 'purchases', 'roas'];
  campaignAvailableMetrics = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];
  isSticky = false;
  panelStep = 1
  toggleSticky(): void {
    this.isSticky = !this.isSticky;
    const modal = document.querySelector('.config-modal') as HTMLElement;
    if (modal) {
      modal.style.position = this.isSticky ? 'sticky' : 'relative';
      modal.style.top = this.isSticky ? '0' : 'unset';
    }
  }
  private chartRefs: Record<string, Chart> = {};
  reportStatsLoading = true;

  availableMetrics = [
    'spend', 'impressions', 'clicks', 'cpc', 'ctr',
    'actions', 'action_values', 'purchase_roas', 'reach'
  ];
  availableGraphMetrics = [
    'spend', 'impressions', 'clicks', 'cpc', 'ctr', 'purchaseRoas',
    'conversionValue', 'purchases', 'addToCart', 'initiatedCheckouts', 'costPerPurchase', 'costPerCart'

  ];

  adMetrics: string[] = ['spend', 'addToCart', 'purchases', 'roas'];
  campaignMetrics: string[] = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];

  selectedMetrics: string[] = ['spend', 'impressions', 'clicks'];
  metricsGraphConfig: any[] = [];

  KPIs: any = {};
  ads: any[] = [];
  campaigns: any[] = [];
  graphs: any[] = [];


  selectedDatePresetText = 'Last 7 Days';

  ngOnInit(): void {
    this.availableMetrics.forEach(m => {
      this.metricSelections.kpis[m] = this.selectedMetrics.includes(m);
      this.metricSelections.graphs[m] = this.selectedMetrics.includes(m);
    });
    this.adAvailableMetrics.forEach(m => this.metricSelections.ads[m] = this.adMetrics.includes(m));
    this.campaignAvailableMetrics.forEach(m => this.metricSelections.campaigns[m] = this.campaignMetrics.includes(m));

    this.KPIs = this.generateMockKPIs();
    this.ads = this.generateMockAds();
    this.campaigns = this.generateMockCampaigns();
    this.graphs = this.generateMockGraphData();
    this.metricsGraphConfig = this.getMetricConfigs().filter(config => this.metricSelections.graphs[config.key]);
    this.reportStatsLoading = false;
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  onMetricSelectionChange(): void {
    this.selectedMetrics = Object.keys(this.metricSelections.kpis).filter(m => this.metricSelections.kpis[m]);
    this.metricsGraphConfig = this.getMetricConfigs().filter(config => this.metricSelections.graphs[config.key]);
    this.adMetrics = this.adAvailableMetrics.filter(m => this.metricSelections.ads[m]);
    this.campaignMetrics = this.campaignAvailableMetrics.filter(m => this.metricSelections.campaigns[m]);

    setTimeout(() => this.initializeCharts(), 0); // Refresh charts
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

  private initializeCharts(): void {
    if (!this.graphs?.length) return;
    const labels = this.graphs.map(g => new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    for (const config of this.metricsGraphConfig) {
      const canvasId = `${config.key}Chart`;
      const canvasEl = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvasEl) continue;

      const data = this.graphs.map(g => parseFloat(g[config.key]) || 0);

      if (this.chartRefs[canvasId]) this.chartRefs[canvasId].destroy();

      this.chartRefs[canvasId] = new Chart(canvasEl, {
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
              font: { size: 16, family: "'Inter Variable', sans-serif" }
            },
            tooltip: {
              callbacks: {
                label: context => config.format(context.parsed.y.toFixed(2))
              }
            },
            datalabels: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value => config.format(Number(value).toFixed(0)),
                font: { family: "'Inter Variable', sans-serif" }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { family: "'Inter Variable', sans-serif" } },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  }

  formatMetricLabel(metric: string): string {
    return metric.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
  }

  formatMetricValue(metric: string, value: any): string {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'number' ? value : parseFloat(value);
    const rounded = isNaN(num) ? value : num.toFixed(2);
    if (['spend', 'cpc'].includes(metric)) return `$${rounded}`;
    if (metric.includes('ctr')) return `${rounded}%`;
    if (metric.includes('roas')) return `${rounded}x`;
    return isNaN(num) ? value : Number(num).toLocaleString();
  }

  getMetricStyle(metric: string): string {
    if (["purchase_roas", "purchaseRoas", "ctr"].includes(metric)) return 'success';
    if (["spend", "cpc"].includes(metric)) return 'primary';
    return '';
  }

  generateMockKPIs() {
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

  generateMockAds() {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: `ad-${i + 1}`,
      name: `Ad Creative #${i + 1}`,
      thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
      spend: parseFloat((Math.random() * 500).toFixed(2)),
      addToCart: Math.floor(Math.random() * 150),
      purchases: Math.floor(Math.random() * 80),
      roas: parseFloat((Math.random() * 5).toFixed(2)),
      sourceUrl: `https://facebook.com/ads/${i + 1}`
    }));
  }

  generateMockCampaigns() {
    return Array.from({ length: 5 }).map((_, i) => ({
      campaign_id: `camp-${i + 1}`,
      campaign_name: `Campaign ${i + 1}`,
      spend: parseFloat((Math.random() * 1500).toFixed(2)),
      purchases: Math.floor(Math.random() * 200),
      conversionRate: parseFloat((Math.random() * 5).toFixed(2)),
      purchaseRoas: parseFloat((Math.random() * 4).toFixed(2))
    }));
  }

  generateMockGraphData() {
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
