import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ScheduleReportRequest,
  Metrics,
  Provider,
  Frequency,
  FACEBOOK_DATE_PRESETS,
  Messages,
  Colors,
} from 'src/app/interfaces/interfaces';
import { MatDialog } from '@angular/material/dialog';
import {
  ScheduleOptionsComponent,
  ScheduleOptionsMatDialogData,
} from 'src/app/components/schedule-options/schedule-options.component';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import { SchedulesService } from '../../services/api/schedules.service.js';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { NotificationService } from '@services/notification.service.js';

export interface SchedulingOption {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  reportName?: string;

  // embedded blocks (server model)
  review?: { required: boolean };
  schedule: {
    timezone: string;
    lastRun?: string;
    nextRun?: string;
    jobId?: string;
    datePreset: FACEBOOK_DATE_PRESETS | string;
    cronExpression: string;
  };
  customization?: {
    colors?: { headerBg?: string; reportBg?: string };
    logos?: {
      client?: { url?: string; gcsUri?: string };
      org?: { url?: string; gcsUri?: string };
    };
    title?: string;
  };
  messaging?: {
    email?: { title?: string; body?: string };
    slack?: string;
    whatsapp?: string;
    pdfFilename?: string;
  };
  providers?: Provider[];

  client: {uuid: string}

  images?: { clientLogo?: string; organizationLogo?: string };

  nextRun?: string;
  lastRun?: string;
  frequency?: string;
}

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss',
})
export class EditReportComponent {
  frequency: Frequency = 'weekly';
  time: string = '09:00';
  dayOfWeek: string = 'Monday';
  dayOfMonth: number = 1;
  intervalDays: number = 1;
  cronExpression: string = '';
  reviewRequired: boolean = false;
  clientUuid: string = '';

  nextRun: string = '';

  messages: Messages = {
    whatsapp: '',
    slack: '',
    email: { title: '', body: '' },
  };

  metricsGraphConfig: any[] = [];
  schedulingOptionId: string | null = null;
  schedulingOption: SchedulingOption | null = null;
  reportSections: ReportSection[] = [];

  selectedDatePreset: string = '';
  selectedDatePresetText: string = '';

  reportTitle: string = '';
  isPreviewMode: boolean = false;

  headerBackgroundColor = signal<string>('#ffffff');
  reportBackgroundColor = signal<string>('#ffffff');

  clientImageUrl = signal<string>('');
  agencyImageUrl = signal<string>('');

  // store GCS URIs to send back to server (from customization.logos)
  clientImageGsUri = signal<string>('');
  agencyImageGsUri = signal<string>('');

  dateRangeText = signal<string>('');

  @ViewChild('reportContainer', { static: false }) reportContainerRef?: ElementRef<HTMLElement>;

  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  public reportsDataService = inject(ReportsDataService);
  private schedulesService = inject(SchedulesService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.schedulingOptionId = params['schedulingOptionId'];
      this.clientUuid = params['clientUuid'];

      await this.loadReport();

      // map from new model
      this.reportTitle = this.schedulingOption?.customization?.title || this.schedulingOption?.reportName || '';
      this.selectedDatePreset = (this.schedulingOption?.schedule?.datePreset as string) || '';
      this.cronExpression = this.schedulingOption?.schedule?.cronExpression || '';
      this.reviewRequired = !!this.schedulingOption?.review?.required;
      this.messages = {
        whatsapp: this.schedulingOption?.messaging?.whatsapp || '',
        slack: this.schedulingOption?.messaging?.slack || '',
        email: {
          title: this.schedulingOption?.messaging?.email?.title || '',
          body: this.schedulingOption?.messaging?.email?.body || '',
        },
      };
      this.nextRun =
        this.schedulingOption?.nextRun ||
        this.schedulingOption?.schedule?.nextRun ||
        '';

      // If backend also returns a derived frequency, use it; otherwise stay on 'cron'
      if (this.schedulingOption?.frequency) {
        this.frequency = (this.schedulingOption.frequency.toLowerCase() as Frequency) || 'cron';
      } else if (this.cronExpression) {
        this.frequency = 'cron';
      }

      // colors
      this.headerBackgroundColor.set(this.schedulingOption?.customization?.colors?.headerBg || '');
      this.reportBackgroundColor.set(this.schedulingOption?.customization?.colors?.reportBg || '');

      // display URLs
      this.clientImageUrl.set(this.schedulingOption?.images?.clientLogo || '');
      this.agencyImageUrl.set(this.schedulingOption?.images?.organizationLogo || '');

      // original GCS URIs (for saving)
      this.clientImageGsUri.set(this.schedulingOption?.customization?.logos?.client?.gcsUri || '');
      this.agencyImageGsUri.set(this.schedulingOption?.customization?.logos?.org?.gcsUri || '');

      this.updateSelectedDatePresetText();
      this.updateDateRangeText();
    });
  }

  private async loadReport() {
    if (!this.schedulingOptionId) return;

    this.schedulingOption = (await this.schedulesService.getSchedulingOption(
      this.schedulingOptionId,
    )) as SchedulingOption;

    // sections based on new model (providers now live at root)
    this.reportSections =
      await this.reportsDataService.getReportsSectionsBasedOnSchedulingOption(this.schedulingOption);
  }

  editScheduleConfiguration() {
    const data: ScheduleOptionsMatDialogData = {
      frequency: this.frequency,
      time: this.time,
      dayOfWeek: this.dayOfWeek,
      dayOfMonth: this.dayOfMonth,
      intervalDays: this.intervalDays,
      cronExpression: this.cronExpression,
      reviewRequired: this.reviewRequired,
      messages: this.messages,
    };

    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data,
    });

    dialogRef.afterClosed().subscribe((result: ScheduleOptionsMatDialogData) => {
      if (!result) return;
      this.frequency = result.frequency;
      this.time = result.time;
      this.dayOfWeek = result.dayOfWeek;
      this.dayOfMonth = result.dayOfMonth;
      this.intervalDays = result.intervalDays;
      this.cronExpression = result.cronExpression;
      this.reviewRequired = result.reviewRequired;
      this.messages = result.messages;

      this.saveConfiguration();
    });
  }

  updateSelectedDatePresetText() {
    if (this.selectedDatePreset) {
      this.selectedDatePresetText =
        this.reportsDataService.DATE_PRESETS.find((p) => p.value === this.selectedDatePreset)?.text ||
        '';
    }
  }

  async saveConfiguration() {
    if (!this.reportSections) return;

    const providers = this.reportsDataService.getProviders(this.reportSections);

    const payload: ScheduleReportRequest = {
      reportName: this.reportTitle,
      frequency: this.frequency,
      time: this.time,
      dayOfWeek: this.dayOfWeek,
      dayOfMonth: this.dayOfMonth,
      intervalDays: this.intervalDays,
      cronExpression: this.cronExpression,

      images: {
        clientLogo: this.clientImageGsUri(),
        organizationLogo: this.agencyImageGsUri(),
      },

      organizationUuid: '', // backend derives from client
      reviewRequired: this.reviewRequired,
      providers,

      datePreset: this.selectedDatePreset as FACEBOOK_DATE_PRESETS,
      clientUuid: this.clientUuid,
      timeZone:
        this.schedulingOption?.schedule?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,

      messages: this.messages,
      colors: {
        headerBackgroundColor: this.headerBackgroundColor(),
        reportBackgroundColor: this.reportBackgroundColor(),
      },
    };

    if (!this.schedulingOptionId) return;

    await this.schedulesService.updateSchedulingOption(this.schedulingOptionId, payload);
    await this.loadReport();
    this.notificationService.info('Scheduled report updated');
  }

  onDatePresetChange(_: any) {
    this.updateSelectedDatePresetText();
    this.updateDateRangeText();
  }

  goBack() {
    this.router.navigate([`/client/${this.clientUuid}`]);
  }

  onSectionFocus(sectionKey: string) {
    const container = this.reportContainerRef?.nativeElement;
    if (!container) return;

    const target = container.querySelector(`#section-${sectionKey}`) as HTMLElement | null;
    if (!target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTopWithinContainer = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({ top: targetTopWithinContainer, behavior: 'smooth' });
  }

  private updateDateRangeText() {
    this.dateRangeText.set(this.reportsDataService.getDateRangeTextForPreset(this.selectedDatePreset as FACEBOOK_DATE_PRESETS, new Date(this.nextRun)));
  }
}
