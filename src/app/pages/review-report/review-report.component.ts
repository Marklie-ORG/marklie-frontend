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

    await this.initializeLoomSDK()

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
      this.availableMetrics = await this.reportService.getAvailableMetrics();
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);
      console.log('Report Sections:', this.reportSections);
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
      await this.reportService.updateReportMetricsSelections(this.reportId, metricsSelections);
      console.log('Report saved successfully!');
      // Optionally, show a success message
    } catch (error) {
      console.error('Error saving report:', error);
      // Handle error, e.g., show an error message
    }
  }

  // New method to initialize Loom SDK
  private async initializeLoomSDK() {
    // const { supported, error } = await isSupported();

    // if (!supported) {
    //   console.warn(`Loom is not supported: ${error}`);
    //   return;
    // }

    const BUTTON_ID = "loom-record-sdk-button";
    const root = document.getElementById("root");
    console.log(root);
    if (!root) {
      return;
    }

    root.innerHTML = `<button id="${BUTTON_ID}">Record</button>`;

    const button = document.getElementById(BUTTON_ID);

    if (!button) {
      return;
    }

    console.log(button);

    // const { configureButton } = await createInstance({
    //   publicAppId: "22495e2c-fa7c-4ec0-ab4a-7910e51e7bde",
    //   mode: "standard",
    //   environment: Environment.Development,
    //   config: { insertButtonText: "hello world" }
    // });

    // configureButton({ element: button, hooks: {
    //   onStart: ()=> {
    //     console.log("start")
    //   },
    //     onRecordingComplete: ()=> {
    //       console.log("complete")
    //     },
    //     onUploadComplete: ()=> {
    //       console.log("upload")
    //     }
    //   } });
  }

}
