import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Daum, GetAvailableMetricsResponse, ReportService} from 'src/app/services/api/report.service';
import {Data, ReportSection} from '../schedule-report/schedule-report.component';
import {MatDialog} from '@angular/material/dialog';
import {MetricsService} from 'src/app/services/metrics.service';
import {ReportsDataService} from 'src/app/services/reports-data.service';
// import {createInstance, Environment} from "@loomhq/record-sdk";
// import {isSupported} from "@loomhq/record-sdk/is-supported";
// import {oembed} from '@loomhq/loom-embed';


@Component({
  selector: 'app-review-view-report',
  templateUrl: './review-report.component.html',
  styleUrl: './review-report.component.scss'
})
export class ReviewReportComponent implements OnInit, OnDestroy { // Added OnDestroy for cleanup
  @ViewChild('loomButton', { static: true }) loomButtonRef!: ElementRef<HTMLButtonElement>;

  data: any
  reportId: string | null = null;
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
      this.reportId = params['id'];
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
    if (!this.reportId) return;
    try {
      const res = await this.reportService.getReport(this.reportId);
      this.data = res.data[1];
      console.log(this.data);
      this.availableMetrics = await this.reportService.getAvailableMetrics();
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);
      console.log('Report Sections:', this.reportSections);
    } catch (error) {
      console.error('Error loading view-report:', error);
      // Handle error, e.g., show a message to the user
    }
  }


  async send() {
    if (!this.reportId) return;
    try {
      const metricsSelections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);
      await this.reportService.updateReportMetricsSelections(this.reportId, metricsSelections);
      console.log('Report saved successfully!');
      // Optionally, show a success message
    } catch (error) {
      console.error('Error saving view-report:', error);
      // Handle error, e.g., show an error message
    }
  }

}
