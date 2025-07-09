import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Daum, GetAvailableMetricsResponse, ReportService} from 'src/app/services/api/report.service';
import {Data, ReportSection} from '../schedule-report/schedule-report.component';
import {MatDialog} from '@angular/material/dialog';
import {MetricsService} from 'src/app/services/metrics.service';
import {ReportsDataService} from 'src/app/services/reports-data.service';

@Component({
  selector: 'app-review-report',
  templateUrl: './review-report.component.html',
  styleUrl: './review-report.component.scss'
})
export class ReviewReportComponent implements OnInit, OnDestroy { // Added OnDestroy for cleanup
  @ViewChild('loomButton', { static: true }) loomButtonRef!: ElementRef<HTMLButtonElement>;
  data: Data = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  reportUuid: string | null = null;
  availableMetrics: GetAvailableMetricsResponse = {};
  reportSections: ReportSection[] = []

  private loomButtonInstance: any = null; // To store the Loom button instance

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
    public metricsService: MetricsService,
    public ref: ChangeDetectorRef,
    private reportsDataService: ReportsDataService
  ) {
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportUuid = params['id'];
      await this.loadReport();
    });
  }


  ngOnDestroy(): void {
    // Clean up Loom button instance if it exists
    if (this.loomButtonInstance) {
      this.loomButtonInstance.cleanup();
    }
  }

  private async loadReport() {
    if (!this.reportUuid) return;
    try {
      const res = await this.reportService.getReport(this.reportUuid);
      const data = res.data[0];
      this.availableMetrics = await this.reportService.getAvailableMetrics();
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);
      console.log('Report Sections:', this.reportSections);
      this.generateMockData(data);
    } catch (error) {
      console.error('Error loading report:', error);
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

  async sendReport() {
    if (!this.reportUuid) return;
    try {
      const metricsSelections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);
      await this.reportService.updateReportMetricsSelections(this.reportUuid, metricsSelections);

      await this.reportService.sendAfterReviewing(this.reportUuid)
      console.log('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }

}
