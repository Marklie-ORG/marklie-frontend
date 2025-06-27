import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Daum, GetAvailableMetricsResponse, ReportService } from 'src/app/services/api/report.service';
import { Data, MetricSectionKey, ReportSection } from '../schedule-report/schedule-report.component';
import { MatDialog } from '@angular/material/dialog';
import { MetricsService } from 'src/app/services/metrics.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';

@Component({
  selector: 'app-review-report',
  templateUrl: './review-report.component.html',
  styleUrl: './review-report.component.scss'
})
export class ReviewReportComponent implements OnInit {

  data: Data = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  reportId: string | null = null;

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
      this.reportId = params['id'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.reportId) return;
    const res = await this.reportService.getReport(this.reportId);
    const data = res.data[0];
    this.availableMetrics = await this.reportService.getAvailableMetrics();
    this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics);
    console.log(this.reportSections);

    this.generateMockData(data);
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

  async save() {
    if (!this.reportId) return;
    const metricsSelections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);
    await this.reportService.updateReportMetricsSelections(this.reportId, metricsSelections);
  }
}
