import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/api/report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-pdf-report',
  templateUrl: './pdf-report.component.html',
  styleUrls: ['./pdf-report.component.scss'],
})
export class PdfReportComponent implements OnInit, OnDestroy {
  KPIs!: any;
  graphs: any[] = [];
  campaigns: any[] = [];
  bestAds: any[] = [];
  reportStatsLoading = false;
  dateRangeLabel = '';
  chartInstances: Record<string, Record<string, Chart>> = {};
  reportData: any[] = [];
  isMultiAccount = false;

  readonly objectKeys = Object.keys;
  readonly chartConfigs = this.reportDataService.getChartConfigs();
  readonly campaignColumnOrder = ['spend', 'purchases', 'conversionRate', 'purchaseRoas'];

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private reportDataService: ReportsDataService
  ) {}

  async ngOnInit(): Promise<void> {
    const reportUuid = this.route.snapshot.params['uuid'];
    if (reportUuid) {
      await this.loadReport(reportUuid);
    }
  }

  ngOnDestroy(): void {
    Object.values(this.chartInstances).forEach((chartGroup) => {
      Object.values(chartGroup).forEach((chart) => {
        chart.destroy();
      });
    });  }

  async loadReport(reportUuid: string): Promise<void> {
    this.reportStatsLoading = true;
    try {
      const res = await this.reportService.getReport(reportUuid);
      this.reportData = res.data;
      console.log(res.data)
      this.isMultiAccount = this.reportData.length > 1;

      this.ref.detectChanges();

      this.reportData.forEach((account, index) => {
        const chartIdPrefix = `account_${index}`;
        requestAnimationFrame(() => {
          this.reportDataService.renderCharts(
            account.graphs,
            this.getChartInstanceGroup(chartIdPrefix),
            this.dateRangeLabel,
            chartIdPrefix
          );
        });
      });
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      this.reportStatsLoading = false;
    }
  }

  private getChartInstanceGroup(prefix: string): Record<string, Chart> {
    if (!this.chartInstances[prefix]) {
      this.chartInstances[prefix] = {};
    }
    return this.chartInstances[prefix];
  }


  private setDateRangeLabel(): void {
    if (!this.graphs.length) return;

    const start = new Date(this.graphs[0].date_start);
    const end = new Date(
      this.graphs.at(-1)?.date_stop ?? this.graphs.at(-1)?.date_start
    );

    const diffDays =
      Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    this.dateRangeLabel = `${start.toLocaleDateString()} – ${end.toLocaleDateString()} (${diffDays} days)`;
  }

  getAdValue(ad: any, key: string): any {
    return ad[key];
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
}
