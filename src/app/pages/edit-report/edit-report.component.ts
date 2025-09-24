import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleReportRequest, Metrics, Provider, Frequency, FACEBOOK_DATE_PRESETS, Messages, Colors } from 'src/app/interfaces/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent, ScheduleOptionsMatDialogData } from 'src/app/components/schedule-options/schedule-options.component';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import {SchedulesService} from "../../services/api/schedules.service.js";
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { NotificationService } from '@services/notification.service.js';

export interface SchedulingOption {
  uuid: string
  createdAt: string
  updatedAt: string
  reportName: string
  cronExpression: string
  datePreset: string
  isActive: boolean
  reportType: string
  jobData: JobData
  timezone: string
  reviewRequired: boolean
  lastRun: any
  nextRun: string
  bullJobId: string
  client: {
    uuid: string
    name: string
  }
  images: {
    clientLogo: string
    organizationLogo: string
  }
}

interface JobData {
  colors: Colors
  time: string
  metrics: Metrics
  timeZone: string
  dayOfWeek: string
  frequency: string
  clientUuid: string
  datePreset: string
  dayOfMonth: number
  intervalDays: number
  reviewNeeded: boolean
  cronExpression: string
  organizationUuid: string,
  messages: {
    whatsapp: string,
    slack: string,
    email: {
      title: string,
      body: string,
    }
  }
  images: {
    clientLogo: string
    organizationLogo: string
  }
  providers: Provider[]
}

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss'
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
    email: {
      title: '',
      body: ''
    }
  }

  metricsGraphConfig: any[] = [];

  schedulingOptionId: string | null = null;

  schedulingOption: SchedulingOption | null = null;

  reportSections: ReportSection[] = []

  selectedDatePreset: string = '';
  selectedDatePresetText: string = '';

  reportTitle: string = '';

  isPreviewMode: boolean = false;

  headerBackgroundColor = signal<string>('#ffffff');
  reportBackgroundColor = signal<string>('#ffffff');

  clientImageUrl = signal<string>('');
  agencyImageUrl = signal<string>('');

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
    this.route.params.subscribe(async params => {
      this.schedulingOptionId = params['schedulingOptionId'];
      this.clientUuid = params['clientUuid'];

      await this.loadReport();

      this.reportTitle = this.schedulingOption?.reportName || '';
      this.selectedDatePreset = this.schedulingOption?.datePreset || '';
      this.frequency = this.schedulingOption?.jobData.frequency as Frequency;
      this.time = this.schedulingOption?.jobData.time || '';
      this.dayOfWeek = this.schedulingOption?.jobData.dayOfWeek || '';
      this.dayOfMonth = this.schedulingOption?.jobData.dayOfMonth || 1;
      this.intervalDays = this.schedulingOption?.jobData.intervalDays || 1;
      this.cronExpression = this.schedulingOption?.cronExpression || '';
      this.reviewRequired = this.schedulingOption?.reviewRequired || false;
      this.messages = this.schedulingOption?.jobData.messages || {
        whatsapp: '',
        slack: '',
        email: {
          title: '',
          body: ''
        }
      }
      this.nextRun = this.schedulingOption?.nextRun || '';

      this.updateSelectedDatePresetText();
      this.updateDateRangeText();
    });
  }

  private async loadReport() {
    if (!this.schedulingOptionId) return;

    this.schedulingOption = await this.schedulesService.getSchedulingOption(this.schedulingOptionId) as SchedulingOption;
    this.clientImageUrl.set(this.schedulingOption?.images.clientLogo || '');
    this.agencyImageUrl.set(this.schedulingOption?.images.organizationLogo || '');
    this.clientImageGsUri.set(this.schedulingOption?.jobData.images?.clientLogo || '');
    this.agencyImageGsUri.set(this.schedulingOption?.jobData.images?.organizationLogo || '');
    this.headerBackgroundColor.set(this.schedulingOption?.jobData.colors?.headerBackgroundColor || '');
    this.reportBackgroundColor.set(this.schedulingOption?.jobData.colors?.reportBackgroundColor || '');

    this.reportSections = await this.reportsDataService.getReportsSectionsBasedOnSchedulingOption(this.schedulingOption);
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
      messages: this.messages
    }

    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: data
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
      this.selectedDatePresetText = this.reportsDataService.DATE_PRESETS.find(preset => preset.value === this.selectedDatePreset)?.text || '';
    }
  }

  async saveConfiguration() {

    if (!this.reportSections) {
      return;
    }

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
        organizationLogo: this.agencyImageGsUri()
      },
      organizationUuid: '',
      reviewRequired: this.reviewRequired,
      providers: providers,
      
      datePreset: this.selectedDatePreset as FACEBOOK_DATE_PRESETS,
      clientUuid: this.clientUuid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      messages: this.messages,
      colors: {
        headerBackgroundColor: this.headerBackgroundColor(),
        reportBackgroundColor: this.reportBackgroundColor()
      }
    };

    console.log(payload)

    if (!this.schedulingOptionId) {
      return
    }

    await this.schedulesService.updateSchedulingOption(this.schedulingOptionId, payload);
    await this.loadReport();
    this.notificationService.info('Scheduled report updated');
  }

  onDatePresetChange(event: any) {
    this.updateSelectedDatePresetText();
    this.updateDateRangeText();
  }

  goBack() {
    this.router.navigate([`/client/${this.clientUuid}`]);
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
    this.dateRangeText.set(this.reportsDataService.getDateRangeTextForPreset(this.selectedDatePreset as FACEBOOK_DATE_PRESETS, new Date(this.nextRun)));
  }
}

