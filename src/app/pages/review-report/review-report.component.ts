import {ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ReportService} from 'src/app/services/api/report.service';
import {Data} from '../schedule-report/schedule-report.component';
import {GetAvailableMetricsResponse} from 'src/app/interfaces/interfaces';
import {MetricsService} from 'src/app/services/metrics.service';
import {ReportsDataService} from 'src/app/services/reports-data.service';
import { SchedulesService } from 'src/app/services/api/schedules.service';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { ReportData } from 'src/app/interfaces/get-report.interfaces';
import { NotificationService } from '@services/notification.service';
import { SendAfterReviewRequest, SendAfterReviewResponse, Messages } from 'src/app/interfaces/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { FinishReviewDialogComponent } from 'src/app/components/finish-review-dialog/finish-review-dialog.component';

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

  providers: ReportData = [];

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
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  private currentMessages: Messages = { whatsapp: '', slack: '', email: { title: '', body: '' } };

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

      this.reportTitle.set(res.metadata.reportName);
      this.selectedDatePresetText.set(this.reportsDataService.DATE_PRESETS.find(preset => preset.value === res.metadata?.datePreset)?.text || '');

      this.clientImageUrl.set(res.metadata.images?.clientLogo || '');
      this.agencyImageUrl.set(res.metadata.images?.organizationLogo || '');
      this.clientImageGsUri.set(res.metadata.images?.clientLogoGsUri || '');
      this.agencyImageGsUri.set(res.metadata.images?.organizationLogoGsUri || '');

      this.reportSections = await this.reportsDataService.getReportsSectionsBasedOnReportData(this.providers);
      
      this.currentMessages = (res.metadata as any)?.messages || this.currentMessages;

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
      await this.reportService.updateReportImages(this.reportUuid, {
        clientLogo: this.clientImageGsUri(),
        organizationLogo: this.agencyImageGsUri()
      });
      await this.reportService.updateReportTitle(this.reportUuid, this.reportTitle());
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
        this.loadReport();
      }
    });
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

}
