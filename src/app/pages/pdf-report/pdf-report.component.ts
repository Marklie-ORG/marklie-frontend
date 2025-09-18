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
import { GetAvailableMetricsResponse } from 'src/app/interfaces/interfaces';
import { MetricsService } from 'src/app/services/metrics.service';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportData } from 'src/app/interfaces/get-report.interfaces';

@Component({
  selector: 'app-pdf-report',
  templateUrl: './pdf-report.component.html',
  styleUrls: ['./pdf-report.component.scss'],
})
export class PdfReportComponent implements OnInit {

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
      this.reportUuid = params['reportUuid'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.reportUuid) return;
    try {
      const res = await this.reportService.getReport(this.reportUuid);

      this.providers = res.data;

      // title
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
      this.headerBackgroundColor.set(
        (colors as any).headerBackgroundColor ?? (colors as any).headerBg ?? '#ffffff'
      );
      this.reportBackgroundColor.set(
        (colors as any).reportBackgroundColor ?? (colors as any).reportBg ?? '#ffffff'
      );

      this.reportSections = await this.reportsDataService.getReportsSectionsBasedOnReportData(this.providers);
    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
