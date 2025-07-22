import {Component, inject, signal} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CreateScheduleRequest, GetAvailableMetricsResponse, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { Data, ReportSection } from '../schedule-report/schedule-report.component';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component';
import { MockReportService } from 'src/app/services/mock-report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import {SchedulesService} from "../../services/api/schedules.service.js";

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
  reviewNeeded: boolean
  lastRun: any
  nextRun: string
  bullJobId: string
  client: string
  images: {
    clientLogo: string
    organizationLogo: string
  }
}

interface JobData {
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
}

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss'
})
export class EditReportComponent {

  schedule: Schedule = {
    reportName: '',
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 'Monday',
    dayOfMonth: 1,
    intervalDays: 1,
    cronExpression: '',
    reviewNeeded: false,
  };
  clientUuid: string = '';

  metricsGraphConfig: any[] = [];

  mockData: Data = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  schedulingOptionId: string | null = null;

  schedulingOption: SchedulingOption | null = null;

  availableMetrics: GetAvailableMetricsResponse = {};

  reportSections: ReportSection[] = []

  selectedDatePreset: string = '';
  selectedDatePresetText: string = '';

  reportTitle: string = '';

  isPreviewMode: boolean = false;

  changesMade = false;

  clientImageUrl = signal<string>('');
  agencyImageUrl = signal<string>('');

  clientImageGsUri = signal<string>('');
  agencyImageGsUri = signal<string>('');

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  private dialog = inject(MatDialog);
  private mockReportService = inject(MockReportService);
  public reportsDataService = inject(ReportsDataService);
  private schedulesService = inject(SchedulesService);

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.schedulingOptionId = params['schedulingOptionId'];

      this.availableMetrics = await this.schedulesService.getAvailableMetrics();

      await this.loadReport();

      this.updateSelectedDatePresetText();

      this.reportTitle = this.schedulingOption?.reportName || '';
      this.selectedDatePreset = this.schedulingOption?.datePreset || '';
    });
  }

  private async loadReport() {
    if (!this.schedulingOptionId) return;

    this.schedulingOption = await this.schedulesService.getSchedulingOption(this.schedulingOptionId) as SchedulingOption;
    this.clientImageUrl.set(this.schedulingOption?.images.clientLogo || '');
    this.agencyImageUrl.set(this.schedulingOption?.images.organizationLogo || '');
    this.clientImageGsUri.set(this.schedulingOption?.jobData.images?.clientLogo || '');
    this.agencyImageGsUri.set(this.schedulingOption?.jobData.images?.organizationLogo || '');

    this.reportSections = await this.reportsDataService.getInitiatedReportsSections(this.availableMetrics, this.schedulingOption);
    this.convertOptionIntoTemplate(this.schedulingOption);
    this.mockData = this.mockReportService.generateMockData();
  }

  convertOptionIntoTemplate(schedulingOption: SchedulingOption) {

    this.schedule = {
      reportName: schedulingOption.reportName,
      frequency: schedulingOption.jobData.frequency,
      time: schedulingOption.jobData.time,
      dayOfWeek: schedulingOption.jobData.dayOfWeek,
      dayOfMonth: schedulingOption.jobData.dayOfMonth,
      intervalDays: schedulingOption.jobData.intervalDays,
      cronExpression: schedulingOption.cronExpression,
      reviewNeeded: schedulingOption.reviewNeeded,
    };

    this.reportSections.forEach(section => {
      section.enabled = schedulingOption.jobData.metrics[section.key].metrics.length > 0;
      section.metrics.forEach(metric => {
        metric.enabled = schedulingOption.jobData.metrics[section.key].metrics.some(m => m.name === metric.name);
      });
    });

  }

  editDelivery() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        clientUuid: this.clientUuid,
        reportSections: this.reportSections,
        schedule: this.schedule,
        isEditMode: true,
        datePreset: this.schedulingOption?.datePreset || '',
        schedulingOptionId: this.schedulingOptionId || '',
        messages: {
          whatsapp: this.schedulingOption?.jobData.messages.whatsapp || '',
          slack: this.schedulingOption?.jobData.messages.slack || '',
          email: {
            title: this.schedulingOption?.jobData.messages.email.title || '',
            body: this.schedulingOption?.jobData.messages.email.body || ''
          }
        }
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    // });

    // dialogRef.componentInstance.scheduleOptionUpdated.subscribe(async () => {
    //   await this.loadReport();
    // });
  }

  editScheduleConfiguration() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        reportSections: this.reportSections,
        clientUuid: this.clientUuid,
        schedule: this.schedule,
        messages: this.schedulingOption?.jobData.messages,
        datePreset: this.schedulingOption?.datePreset,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.schedule = result.schedule;
      this.schedulingOption!.datePreset = result.datePreset;
      this.schedulingOption!.jobData.messages = result.messages;
      this.updateSelectedDatePresetText();

      this.saveConfiguration();
    });
  }

  updateSelectedDatePresetText() {
    if (this.schedulingOption?.datePreset) {
      this.selectedDatePresetText = this.reportsDataService.DATE_PRESETS.find(preset => preset.value === this.schedulingOption?.datePreset)?.text || '';
    }
  }

  async saveConfiguration() {

    if (!this.reportSections || !this.schedule) {
      return;
    }

    const selections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);

    const payload: CreateScheduleRequest = {
      ...(this.schedule),
      metrics: selections,
      datePreset: this.schedulingOption!.datePreset,
      clientUuid: this.schedulingOption!.jobData.clientUuid,
      reportName: this.reportTitle,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      messages: this.schedulingOption!.jobData.messages,
      images: {
        clientLogo: this.clientImageGsUri(),
        organizationLogo: this.agencyImageGsUri()
      }
    };

    if (!this.schedulingOptionId) {
      return
    }

    await this.schedulesService.updateSchedulingOption(this.schedulingOptionId, payload);
    await this.loadReport();
  }

  onDatePresetChange(event: any) {
    this.schedulingOption!.datePreset = this.selectedDatePreset;
    this.updateSelectedDatePresetText();
  }

}

