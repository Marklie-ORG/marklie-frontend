import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Daum, GetAvailableMetricsResponse, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { MockData, ReportSection } from '../schedule-report/schedule-report.component';
import { Chart } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { MetricSelections } from 'src/app/components/edit-report-content/edit-report-content.component';
import { SchedulingOption } from '../edit-report/edit-report.component';
import { MetricsService } from 'src/app/services/metrics.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';

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

  availableMetrics: GetAvailableMetricsResponse = {};

  reportSections: ReportSection[] = []

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
    public metricsService: MetricsService,
    public ref: ChangeDetectorRef,
    private reportsDataService: ReportsDataService
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportId = params['uuid'];

      this.availableMetrics = await this.reportService.getAvailableMetrics();

      this.reportSections = await this.reportsDataService.getInitiatedReportsSections(this.availableMetrics);

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

    if (data.ads.length === 0) this.reportSections.find(s => s.key === 'ads')!.enabled = false;
    if (data.graphs.length === 0) this.reportSections.find(s => s.key === 'graphs')!.enabled = false;
    if (data.campaigns.length === 0) this.reportSections.find(s => s.key === 'campaigns')!.enabled = false;
    if (!data.KPIs || Object.keys(data.KPIs).length === 0) this.reportSections.find(s => s.key === 'kpis')!.enabled = false;

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
