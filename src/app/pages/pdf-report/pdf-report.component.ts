import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/api/report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import { Data } from '../schedule-report/schedule-report.component';
import { GetAvailableMetricsResponse } from 'src/app/interfaces/interfaces';
import { MetricsService } from 'src/app/services/metrics.service';
import { SchedulesService } from 'src/app/services/api/schedules.service';
// import { SchedulingOption } from '../edit-report/edit-report.component';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportData } from 'src/app/interfaces/get-report.interfaces';

@Component({
  selector: 'app-pdf-report',
  templateUrl: './pdf-report.component.html',
  styleUrls: ['./pdf-report.component.scss'],
})
export class PdfReportComponent implements OnInit {
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

  isPreviewMode: boolean = false;

  changesMade = false;

  clientImageUrl = signal<string>('');
  agencyImageUrl = signal<string>('');

  clientImageGsUri = signal<string>('');
  agencyImageGsUri = signal<string>('');

  reportTitle = signal<string>('');
  selectedDatePresetText = signal<string>('');

  //
  reportData: ReportData = [];
  //

  // schedulingOption: SchedulingOption | null = null;

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);
  private schedulesService = inject(SchedulesService);

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
      this.reportData = res.data;

      this.reportTitle.set(res.metadata.reportName);
      this.selectedDatePresetText.set(this.reportsDataService.DATE_PRESETS.find(preset => preset.value === res.metadata?.datePreset)?.text || '');

      // this.schedulingOption = await this.schedulesService.getSchedulingOption(res.schedulingOption) as SchedulingOption;
      this.clientImageUrl.set(res.metadata.images?.clientLogo || '');
      this.agencyImageUrl.set(res.metadata.images?.organizationLogo || '');
      this.clientImageGsUri.set(res.metadata.images?.clientLogo || '');
      this.agencyImageGsUri.set(res.metadata.images?.organizationLogo || '');

      
      this.reportSections = await this.reportsDataService.getReportsSectionsBasedOnReportData(this.reportData);

    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
