import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  AfterViewChecked
} from '@angular/core';
import { Chart } from 'chart.js';
import { ReportSection } from '../../../pages/schedule-report/schedule-report.component.js';
import { ReportsDataService } from '../../../services/reports-data.service.js';
import { MockReportService } from '../../../services/mock-report.service.js';

@Component({
  selector: 'charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements AfterViewInit, OnChanges, AfterViewChecked {
  @Input() data: any;
  @Input() adAccountId: string = 'account';
  @Input() reportSection: ReportSection | undefined;
  @Input() prefix: string = 'account';
  @Input() isMockMode: boolean = false;

  private chartStore: Record<string, Chart> = {};
  displayedGraphs: any[] = [];
  private chartData: any[] = [];
  private chartsInitialized = false;

  constructor(
    private reportsDataService: ReportsDataService,
    private mockReportService: MockReportService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportSection'] || changes['data'] || changes['isMockMode']) {
      this.setupDisplayedGraphs();
      this.chartsInitialized = false;
    }
  }

  ngAfterViewInit(): void {
    this.prefix = this.adAccountId ?? "account";
  }

  ngAfterViewChecked(): void {
    if (!this.chartsInitialized && this.displayedGraphs.length) {
      const dateLabel = this.reportsDataService.getDateRangeLabel(this.chartData);
      this.reportsDataService.renderCharts(this.chartData, this.chartStore, dateLabel, this.prefix);
      this.chartsInitialized = true;
    }
  }

  private setupDisplayedGraphs(): void {
    this.prefix = this.adAccountId ?? "account";

    this.chartData = this.isMockMode
      ? this.mockReportService.generateMockData().graphs
      : this.data;

    if (!this.reportSection?.metrics?.length || !this.chartData?.length) return;

    const selectedMetrics = this.reportSection.metrics
      .filter(m => m.enabled)
      .sort((a, b) => a.order - b.order);

    const configMap = this.reportsDataService.getChartConfigs();
    const unmatched: string[] = [];


    this.displayedGraphs = selectedMetrics.map(m => {
      const config = configMap.find(cfg => cfg.metric === m.name);
      if (!config) unmatched.push(m.name);
      return config;
    }).filter(Boolean);


    if (unmatched.length) {
      console.warn('Unmatched graph config keys:', unmatched);
    }
  }
}
