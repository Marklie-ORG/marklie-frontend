import {
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportService } from '../../services/api/report.service.js';
import { ReportsDataService } from '../../services/reports-data.service.js';
import { Data } from '../schedule-report/schedule-report.component.js';
import { GetAvailableMetricsResponse } from 'src/app/interfaces/interfaces.js';
import { MetricsService } from 'src/app/services/metrics.service.js';
import { SchedulesService } from 'src/app/services/api/schedules.service.js';


@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss'],
})
export class ViewReportComponent implements OnInit {

  data: Data = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  reportId: string | null = null;
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
  selectedAdAccountIndex = -1;
  reportData: any[] = [];
  //

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);
  private schedulesService = inject(SchedulesService);

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportId = params['id'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.reportId) return;
    try {
      const res = await this.reportService.getReport(this.reportId);
      this.reportData = res.data;

      this.reportTitle.set(res.metadata.reportName);
      this.selectedDatePresetText.set(this.reportsDataService.DATE_PRESETS.find(preset => preset.value === res.metadata?.datePreset)?.text || '');

      this.clientImageUrl.set(res.images?.clientLogo || '');
      this.agencyImageUrl.set(res.images?.organizationLogo || '');
      this.clientImageGsUri.set(res.metadata.images?.clientLogo || '');
      this.agencyImageGsUri.set(res.metadata.images?.organizationLogo || '');
      
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);

      this.processSelectedAccount();

    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  public processSelectedAccount(): void {
    const isAllAccounts = Number(this.selectedAdAccountIndex) === -1;
    const data = isAllAccounts
      ? this.reportsDataService.aggregateReports(this.reportData)
      : this.reportData[this.selectedAdAccountIndex];

    this.data = {
      KPIs: data.KPIs,
      ads: data.ads,
      campaigns: data.campaigns,
      graphs: data.graphs
    }

    this.ref.detectChanges();
  }

}
