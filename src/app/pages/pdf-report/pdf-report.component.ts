import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Daum, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { MockData, ReportSection } from '../schedule-report/schedule-report.component';
import { Chart } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { MetricSelections } from 'src/app/components/edit-report-content/edit-report-content.component';
import { SchedulingOption } from '../edit-report/edit-report.component';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'app-pdf-report',
  templateUrl: './pdf-report.component.html',
  styleUrls: ['./pdf-report.component.scss']
})
export class PdfReportComponent implements OnInit {

  schedule: Schedule = {
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 'Monday',
    dayOfMonth: 1,
    intervalDays: 1,
    cronExpression: '',
    reviewNeeded: false,
  };
  clientUuid: string = '';
  reportStatsLoading = false;

  metricSelections: MetricSelections = {
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

  metricsGraphConfig: any[] = [];

  data: MockData = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  private chartRefs: Record<string, Chart> = {};

  reportId: string | null = null;

  schedulingOption: SchedulingOption | null = null;

  availableMetrics: Metrics = {
    kpis: [],
    graphs: [],
    ads: [],
    campaigns: []
  };

  reportSections: ReportSection[] = []

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
    public metricsService: MetricsService,
    public ref: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportId = params['uuid'];

      this.availableMetrics = await this.reportService.getAvailableMetrics();
      // this.availableMetrics = {
      //   kpis: [
      //     'spend',
      //     'purchaseRoas',
      //     'conversionValue',
      //     'purchases',
      //     'impressions',
      //     'clicks',
      //     'cpc',
      //     'ctr',
      //     'costPerPurchase',
      //     'addToCart',
      //     'costPerAddToCart',
      //     'initiatedCheckouts'
      //   ],
      //   graphs: 
      //   [
      //       'spend', 'impressions', 'clicks', 'ctr', 'cpc', 'purchaseRoas',
      //       'conversionValue', 'engagement', 'purchases', 'costPerPurchase',
      //       'costPerCart', 'addToCart', 'initiatedCheckouts', 'conversionRate',
      //       'date_start', 'date_stop'
      //     ],
      //   ads: 
      //   [
      //     'adId', 'adCreativeId', 'thumbnailUrl', 'spend',
      //     'addToCart', 'purchases', 'roas', 'sourceUrl'
      //   ],
      //   campaigns: 
      //   [
      //       'index', 'campaign_name', 'spend', 'purchases',
      //       'conversionRate', 'purchaseRoas'
      //   ]
      // }

      this.reportSections = [
        { key: 'kpis', title: 'KPIs', enabled: true, metrics: this.availableMetrics.kpis },
        { key: 'graphs', title: 'Graphs', enabled: true, metrics: this.availableMetrics.graphs },
        { key: 'ads', title: 'Ads', enabled: true, metrics: this.availableMetrics.ads },
        { key: 'campaigns', title: 'Campaigns', enabled: true, metrics: this.availableMetrics.campaigns }
      ];

      await this.loadReport();
      
    });
  }

  private async loadReport() {
    if (!this.reportId) return;
    const res = await this.reportService.getReport(this.reportId);
    const data = res.data[0];
    
    // this.report = await this.reportService.getSchedulingOption(this.schedulingOptionId) as SchedulingOption;
    this.convertOptionIntoTemplate(data);
    this.generateMockData(data);
  }

  convertOptionIntoTemplate(data: Daum) {

    const initSelection = (keys: string[], selectedMetrics: string[]) => keys.reduce((acc, k) => ({ ...acc, [k]: selectedMetrics.includes(k) }), {});

    if (data.ads.length === 0) this.panelToggles.ads = false;
    if (data.graphs.length === 0) this.panelToggles.graphs = false;
    if (data.campaigns.length === 0) this.panelToggles.campaigns = false;
    if (!data.KPIs || Object.keys(data.KPIs).length === 0) this.panelToggles.kpis = false;

    this.metricSelections = {
      kpis: initSelection(this.availableMetrics.kpis, data?.KPIs ? Object.keys(data.KPIs) : []),
      graphs: initSelection(this.availableMetrics.graphs, data.graphs[0] ? Object.keys(data.graphs[0]) : []),
      ads: initSelection(this.availableMetrics.ads, data.ads[0] ? Object.keys(data.ads[0]) : []),
      campaigns: initSelection(this.availableMetrics.campaigns, data.campaigns[0] ? Object.keys(data.campaigns[0]) : []),
    }
    
  }

  private generateMockData(data: Daum): void {
    this.data.KPIs = data.KPIs;
    this.data.ads = data.ads;
    this.data.campaigns = data.campaigns;
    this.data.graphs = data.graphs;
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }
  
}
