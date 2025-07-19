import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetAvailableMetricsResponse, ReportService } from 'src/app/services/api/report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import { Data, ReportSection } from '../schedule-report/schedule-report.component';
import { MetricsService } from 'src/app/services/metrics.service';

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

  reportId: string | null = null;
  availableMetrics: GetAvailableMetricsResponse = {};
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
  reportData: any[] = [];
  //

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);

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
      this.agencyImageUrl.set(res.images?.agencyLogo || '');
      this.clientImageGsUri.set(res.metadata.images?.clientLogo || '');
      this.agencyImageGsUri.set(res.metadata.images?.agencyLogo || '');

      this.availableMetrics = await this.reportService.getAvailableMetrics();
      this.reportSections = this.reportsDataService.MetricsSelectionsToReportSections(res.metadata.metricsSelections, this.availableMetrics, false);
      
    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
