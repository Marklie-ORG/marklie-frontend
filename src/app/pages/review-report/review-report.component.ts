import {ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ReportService} from 'src/app/services/api/report.service';
import {Data} from '../schedule-report/schedule-report.component';
import {GetAvailableMetricsResponse, ReportSection} from 'src/app/interfaces/interfaces';
import {MetricsService} from 'src/app/services/metrics.service';
import {ReportsDataService} from 'src/app/services/reports-data.service';
import { SchedulesService } from 'src/app/services/api/schedules.service';

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

  reportUuid: string = '';
  clientUuid: string = '';
  availableMetrics: GetAvailableMetricsResponse = [];
  reportSections: ReportSection[] = []
  private schedulesService = inject(SchedulesService);

  isPreviewMode: boolean = false;

  changesMade = false;

  clientImageUrl = signal<string>('');
  agencyImageUrl = signal<string>('');

  clientImageGsUri = signal<string>('');
  agencyImageGsUri = signal<string>('');

  reportTitle = signal<string>('');
  selectedDatePresetText = signal<string>('');

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportUuid = params['reportUuid'];
      this.clientUuid = params['clientUuid'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.reportUuid) return;
    try {
      const res = await this.reportService.getReport(this.reportUuid);
      const data = res.data[0];

      this.reportTitle.set(res.metadata.reportName);
      this.selectedDatePresetText.set(this.reportsDataService.DATE_PRESETS.find(preset => preset.value === res.metadata?.datePreset)?.text || '');

      this.clientImageUrl.set(res.images?.clientLogo || '');
      this.agencyImageUrl.set(res.images?.organizationLogo || '');
      this.clientImageGsUri.set(res.metadata.images?.clientLogo || '');
      this.agencyImageGsUri.set(res.metadata.images?.organizationLogo || '');
      
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);

      this.data = {
        KPIs: data.KPIs,
        ads: data.ads,
        campaigns: data.campaigns,
        graphs: data.graphs
      }

    } catch (error) {
      console.error('Error loading report:', error);
      // Handle error, e.g., show a message to the user
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  async save() {
    if (!this.reportUuid) return;
    try {
      // const metricsSelections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);
      // await this.reportService.updateReportMetricsSelections(this.reportUuid, metricsSelections);
      // await this.reportService.updateReportImages(this.reportUuid, {
      //   clientLogo: this.clientImageGsUri(),
      //   organizationLogo: this.agencyImageGsUri()
      // });
      console.log('Report saved successfully!');
      // Optionally, show a success message
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }

}
