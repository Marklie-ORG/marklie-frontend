import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ReportService} from 'src/app/services/api/report.service';
import {FACEBOOK_DATE_PRESETS, GetAvailableMetricsResponse} from 'src/app/interfaces/interfaces';
import {MetricsService} from 'src/app/services/metrics.service';
import {ReportsDataService} from 'src/app/services/reports-data.service';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportData } from 'src/app/interfaces/get-report.interfaces';
import { NotificationService } from '@services/notification.service';
import { SendAfterReviewRequest, SendAfterReviewResponse, Messages } from 'src/app/interfaces/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { FinishReviewDialogComponent } from 'src/app/components/finish-review-dialog/finish-review-dialog.component';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-review-report',
  templateUrl: './review-report.component.html',
  styleUrl: './review-report.component.scss'
})
export class ReviewReportComponent implements OnInit {

  protected readonly faDownload = faDownload;

  reportUuid: string = '';
  clientUuid: string = '';
  availableMetrics: GetAvailableMetricsResponse = [];
  reportSections: ReportSection[] = []

  isPreviewMode: boolean = false;

  changesMade = false;

  providers: ReportData = [];

  clientImageUrl = signal<string>('');
  agencyImageUrl = signal<string>('');

  clientImageGsUri = signal<string>('');
  agencyImageGsUri = signal<string>('');

  reportTitle = signal<string>('');
  selectedDatePresetText = signal<string>('');

  headerBackgroundColor = signal<string>('#ffffff');
  reportBackgroundColor = signal<string>('#ffffff');

  dateRangeText = signal<string>('');
  datePreset = signal<string>('');
  reportCreatedAt = signal<string>('');

  pdfFilename = signal<string>('report.pdf');

  @ViewChild('reportContainer', { static: false }) reportContainerRef?: ElementRef<HTMLElement>;

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  public metricsService = inject(MetricsService);
  public ref = inject(ChangeDetectorRef);
  private reportsDataService = inject(ReportsDataService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  private currentMessages: Messages = { whatsapp: '', slack: '', email: { title: '', body: '' } };

  // Loom popover state
  loomPopoverOpen: boolean = false;
  loomUrlInput: string = '';

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
      this.headerBackgroundColor.set(
        (colors as any).headerBackgroundColor ?? (colors as any).headerBg ?? '#ffffff'
      );
      this.reportBackgroundColor.set(
        (colors as any).reportBackgroundColor ?? (colors as any).reportBg ?? '#ffffff'
      );

      this.reportSections =
        await this.reportsDataService.getReportsSectionsBasedOnReportData(this.providers);

      this.currentMessages = res.messaging ?? this.currentMessages;

      // Initialize Loom URL input if present
      this.loomUrlInput = res.review.loomUrl || '';

    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  async save() {
    if (!this.reportUuid) return;
    try {
      const providers = this.reportsDataService.getProviders(this.reportSections);
      await this.reportService.updateReportData(this.reportUuid, providers);
      await this.reportService.updateReportMetadata(this.reportUuid, {
        reportName: this.reportTitle(),
        images: {
          clientLogoGsUri: this.clientImageGsUri(),
          organizationLogoGsUri: this.agencyImageGsUri()
        },
        // messages: this.currentMessages,
        colors: {
          headerBackgroundColor: this.headerBackgroundColor(),
          reportBackgroundColor: this.reportBackgroundColor()
        }
      });
      // await this.reportService.updateReportImages(this.reportUuid, {
      //   clientLogo: this.clientImageGsUri(),
      //   organizationLogo: this.agencyImageGsUri()
      // });
      // await this.reportService.updateReportTitle(this.reportUuid, this.reportTitle());
      this.notificationService.info('Report updated successfully!');
      await this.loadReport();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }

  openFinishReviewDialog() {
    if (!this.reportUuid) return;
    this.dialog.open(FinishReviewDialogComponent, {
      width: '720px',
      data: {
        reportUuid: this.reportUuid,
        messages: this.currentMessages
      }
    }).afterClosed().subscribe((didSend: boolean) => {
      if (didSend) {
        // this.loadReport();
        this.router.navigate(['/reports-database']);
      }
    });
  }

  openLoomPopover() {
    this.loomPopoverOpen = true;
  }

  closeLoomPopover() {
    this.loomPopoverOpen = false;
  }

  async saveLoomUrl() {
    if (!this.reportUuid) return;
    try {
      await this.reportService.updateReportMetadata(this.reportUuid, { loomLink: this.loomUrlInput });
      this.notificationService.info('Loom link saved');
      this.closeLoomPopover();
    } catch (error) {
      console.error('Error saving Loom URL:', error);
    }
  }

  async sendAfterReview() {
    // Kept for backward compatibility if used elsewhere, but prefer openFinishReviewDialog()
    if (!this.reportUuid) return;
    try {
      const payload: SendAfterReviewRequest = { reportUuid: this.reportUuid };
      const res: SendAfterReviewResponse = await this.reportService.sendAfterReview(payload);
      this.notificationService.info(res.message || 'Report was saved and sent to the client');
    } catch (error) {
      console.error('Error sending report after review:', error);
    }
  }

  onSectionFocus(sectionKey: string) {
    const container = this.reportContainerRef?.nativeElement;
    if (!container) {
      return;
    }

    const target = container.querySelector(`#section-${sectionKey}`) as HTMLElement | null;
    if (!target) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTopWithinContainer = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({ top: targetTopWithinContainer, behavior: 'smooth' });
  }

  private updateDateRangeText() {
    this.dateRangeText.set(this.reportsDataService.getDateRangeTextForPreset(this.datePreset() as FACEBOOK_DATE_PRESETS, new Date(this.reportCreatedAt())));
  }

  async downloadPdf() {
    console.log('downloadPdf', this.reportUuid, this.pdfFilename());
    if (!this.reportUuid) return;
    this.reportsDataService.downloadPdf(this.reportUuid, this.pdfFilename());
  }

}
