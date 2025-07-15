import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { ReportService } from '../../services/api/report.service.js';
import { ReportsDataService } from '../../services/reports-data.service.js';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, OnDestroy {
  KPIs!: any;
  graphs: any[] = [];
  campaigns: any[] = [];
  bestAds: any[] = [];
  reportData: any[] = [];
  selectedAccountIndex = -1;
  reportStatsLoading = false;
  dateRangeLabel = '';

  readonly objectKeys = Object.keys;
  readonly chartConfigs = this.reportDataService.getChartConfigs();
  readonly campaignColumnOrder = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];

  private chartInstances: Record<string, Chart> = {};

  constructor(
    private reportService: ReportService,
    private reportDataService: ReportsDataService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const reportUuid = this.route.snapshot.params['uuid'];
    if (reportUuid) {
      await this.loadReport(reportUuid);
    }
  }

  ngOnDestroy(): void {
    Object.values(this.chartInstances).forEach((chart) => chart.destroy());
  }

  async loadReport(uuid: string): Promise<void> {
    this.reportStatsLoading = true;
    try {
      const res = await this.reportService.getReport(uuid);
      this.reportData = res.data;
      this.selectedAccountIndex = -1;
      this.processSelectedAccount();
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      this.reportStatsLoading = false;
    }
  }

  onAccountChange(): void {
    this.processSelectedAccount();
  }

  private processSelectedAccount(): void {
    const isAllAccounts = Number(this.selectedAccountIndex) === -1;
    const data = isAllAccounts
      ? this.reportDataService.aggregateReports(this.reportData)
      : this.reportData[this.selectedAccountIndex];

    this.KPIs = data.KPIs;
    this.graphs = data.graphs;
    this.campaigns = data.campaigns;
    this.bestAds = data.ads;

    this.setDateRangeLabel();
    this.ref.detectChanges();

    const prefix = `account_${this.selectedAccountIndex}`;

    for (const key in this.chartInstances) {
      if (key.startsWith(prefix)) {
        this.chartInstances[key].destroy();
        delete this.chartInstances[key];
      }
    }

    setTimeout(() => {
      this.reportDataService.renderCharts(
        this.graphs,
        this.chartInstances,
        this.dateRangeLabel,
        prefix
      );
    }, 0);
  }

  private setDateRangeLabel(): void {
    if (!this.graphs.length) return;

    const start = new Date(this.graphs[0].date_start);
    const end = new Date(
      this.graphs[this.graphs.length - 1].date_stop ?? this.graphs[this.graphs.length - 1].date_start
    );

    const diffDays = Math.ceil(
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    this.dateRangeLabel = `${start.toLocaleDateString()} – ${end.toLocaleDateString()} (${diffDays} days)`;
  }

  formatMetricLabel(metric: string): string {
    return this.reportDataService.formatMetricLabel(metric);
  }

  formatMetricValue(metric: string, value: any): string {
    return this.reportDataService.formatMetricValue(metric, value);
  }

  getMetricStyle(metric: string): string {
    return this.reportDataService.getMetricStyle(metric);
  }

  getAdValue(ad: any, key: string): any {
    return ad[key];
  }
}
