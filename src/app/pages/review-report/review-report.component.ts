import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Daum, GetAvailableMetricsResponse, ReportService} from 'src/app/services/api/report.service';
import {Data, ReportSection} from '../schedule-report/schedule-report.component';
import {MatDialog} from '@angular/material/dialog';
import {MetricsService} from 'src/app/services/metrics.service';
import {ReportsDataService} from 'src/app/services/reports-data.service';
import {SchedulesService} from "../../services/api/schedules.service.js";


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

  reportId: string | null = null;
  availableMetrics: GetAvailableMetricsResponse = {};
  reportSections: ReportSection[] = []
  private schedulesService = inject(SchedulesService);

  private loomButtonInstance: any = null; // To store the Loom button instance

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
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
      const data = res.data[0];
      this.availableMetrics = await this.schedulesService.getAvailableMetrics();
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);
      this.generateMockData(data);
    } catch (error) {
      console.error('Error loading report:', error);
      // Handle error, e.g., show a message to the user
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

  async save() {
    if (!this.reportId) return;
    try {
      const metricsSelections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);
      await this.schedulesService.updateReportMetricsSelections(this.reportId, metricsSelections);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }

}
