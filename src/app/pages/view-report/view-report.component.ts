import {
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportService } from '@services/api/report.service.js';
import { ReportsDataService } from '@services/reports-data.service.js';
import { FACEBOOK_DATE_PRESETS, GetAvailableMetricsResponse } from 'src/app/interfaces/interfaces.js';
import { MetricsService } from 'src/app/services/metrics.service.js';
import { ReportData } from 'src/app/interfaces/get-report.interfaces.js';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from '@services/api/organization.service';


@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss'],
})
export class ViewReportComponent implements OnInit {

  protected readonly faDownload = faDownload;

  reportId: string | null = null;
  availableMetrics: GetAvailableMetricsResponse = [];
  reportSections: ReportSection[] = [];

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

  dateRangeText = signal<string>('');
  datePreset = signal<string>('');
  reportCreatedAt = signal<string>('');
  
  pdfFilename = signal<string>('report.pdf');

  isLoadingReport = signal<boolean>(false);
  loadErrorMessage = signal<string>('');
  showRequestAccessForm = signal<boolean>(false);

  requestAccessSubmitting = signal<boolean>(false);
  requestAccessSuccess = signal<boolean>(false);
  requestAccessErrorMessage = signal<string>('');

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);
  private formBuilder = inject(FormBuilder);
  private organizationService = inject(OrganizationService);

  requestAccessForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.reportId = params['reportUuid'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.reportId) return;

    this.isLoadingReport.set(true);
    this.loadErrorMessage.set('');
    this.showRequestAccessForm.set(false);
    this.requestAccessSuccess.set(false);
    this.requestAccessErrorMessage.set('');
    this.reportSections = [];

    try {
      const res = await this.reportService.getReport(this.reportId);

      this.providers = res.data as ReportData;

      this.reportTitle.set(res.customization?.title ?? '');

      this.datePreset.set(res.schedule?.datePreset ?? '');
      this.selectedDatePresetText.set(
        this.reportsDataService.DATE_PRESETS.find(p => p.value === this.datePreset())?.text || ''
      );

      this.reportCreatedAt.set(res.createdAt ?? '');
      
      this.pdfFilename.set((res.messaging?.pdfFilename || res.customization?.title || 'report') + (/(\.pdf)$/i.test(res.messaging?.pdfFilename || '') ? '' : '.pdf'));

      this.updateDateRangeText();

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

      console.log(this.reportSections)

    } catch (error) {
      console.error('Error loading report:', error);
      const err = error as HttpErrorResponse;
      if (err?.status === 401) {
        this.showRequestAccessForm.set(true);
      } else {
        this.loadErrorMessage.set('Unable to load this report right now. Please try again later.');
      }
    } finally {
      this.isLoadingReport.set(false);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  private updateDateRangeText() {
    this.dateRangeText.set(this.reportsDataService.getDateRangeTextForPreset(this.datePreset() as FACEBOOK_DATE_PRESETS, new Date(this.reportCreatedAt())));
  }

  async submitAccessRequest() {
    if (!this.reportId) return;

    if (this.requestAccessForm.invalid) {
      this.requestAccessForm.markAllAsTouched();
      return;
    }

    this.requestAccessSubmitting.set(true);
    this.requestAccessSuccess.set(false);
    this.requestAccessErrorMessage.set('');

    const { email } = this.requestAccessForm.value;

    try {
      await this.organizationService.requestClientAccess({
        email: email ?? '',
        reportUuid: this.reportId,
      });
      this.requestAccessSuccess.set(true);
      this.requestAccessForm.reset({ email: '' });
    } catch (error) {
      const err = error as HttpErrorResponse;
      const backendMessage = (err?.error && typeof err.error === 'object' && 'message' in err.error)
        ? String((err.error as { message?: unknown }).message ?? '')
        : '';
      this.requestAccessErrorMessage.set(backendMessage || 'Could not submit your request. Please try again later.');
    } finally {
      this.requestAccessSubmitting.set(false);
    }
  }

  async downloadPdf() {
    if (!this.reportId) return;
    this.reportsDataService.downloadPdf(this.reportId, this.pdfFilename());
  }

}
