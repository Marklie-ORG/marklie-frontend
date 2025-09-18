import {
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportService } from '@services/api/report.service.js';
import { ReportsDataService } from '@services/reports-data.service.js';
import { GetAvailableMetricsResponse } from 'src/app/interfaces/interfaces.js';
import { MetricsService } from 'src/app/services/metrics.service.js';
import { ReportData } from 'src/app/interfaces/get-report.interfaces.js';


@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss'],
})
export class ViewReportComponent implements OnInit {

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

  selectedAdAccountIndex = -1;
  providers: ReportData = [];

  headerBackgroundColor = signal<string>('#ffffff');
  reportBackgroundColor = signal<string>('#ffffff');

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportId = params['reportUuid'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.reportId) return;

    try {
      const res = await this.reportService.getReport(this.reportId);

      this.providers = res.data as ReportData;

      this.reportTitle.set(res.customization?.title ?? '');

      const preset = res.schedule?.datePreset ?? '';
      this.selectedDatePresetText.set(
        this.reportsDataService.DATE_PRESETS.find(p => p.value === preset)?.text || ''
      );

      const orgLogo = res.customization?.logos?.org ?? {};
      const clientLogo = res.customization?.logos?.client ?? {};

      this.agencyImageUrl.set(orgLogo.url ?? '');
      this.clientImageUrl.set(clientLogo.url ?? '');

      this.agencyImageGsUri.set(orgLogo.gcsUri ?? '');
      this.clientImageGsUri.set(clientLogo.gcsUri ?? '');

      const colors = res.customization?.colors ?? {};
      const headerBg =
        (colors as any).headerBackgroundColor ??
        (colors as any).headerBg ??
        '#ffffff';
      const reportBg =
        (colors as any).reportBackgroundColor ??
        (colors as any).reportBg ??
        '#ffffff';

      this.headerBackgroundColor.set(headerBg);
      this.reportBackgroundColor.set(reportBg);

      this.reportSections = await this.reportsDataService.getReportsSectionsBasedOnReportData(this.providers);

    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
