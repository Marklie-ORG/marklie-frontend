import { Component, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CreateScheduleRequest, GetAvailableMetricsResponse, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { Data, ReportSection } from '../schedule-report/schedule-report.component';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component';
import { MockReportService } from 'src/app/services/mock-report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';

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
}

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss'
})
export class EditReportComponent {

  changesMade = false;

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
  reportStatsLoading = false;

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
  selectedDatePresetText: string | undefined = undefined;

  reportTitle: string | undefined = undefined;

  isPreviewMode: boolean = false;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private mockReportService: MockReportService,
    public reportsDataService: ReportsDataService,
    private reportsService: ReportService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.schedulingOptionId = params['schedulingOptionId'];

      this.availableMetrics = await this.reportService.getAvailableMetrics();

      await this.loadReport();

      this.updateSelectedDatePresetText();

      this.reportTitle = this.schedulingOption?.reportName;
      this.selectedDatePreset = this.schedulingOption?.datePreset || '';

      // this.editScheduleConfiguration()
    });
  }

  private async loadReport() {
    if (!this.schedulingOptionId) return;
    this.schedulingOption = await this.reportService.getSchedulingOption(this.schedulingOptionId) as SchedulingOption;
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
      // reportName: this.reportTitle,
      ...(this.schedule),
      metrics: selections,
      datePreset: this.schedulingOption!.datePreset,
      clientUuid: this.clientUuid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      messages: this.schedulingOption!.jobData.messages
    };

    console.log(selections)
    console.log(payload);

    if (!this.schedulingOptionId) {
      return
    }

    await this.reportsService.updateSchedulingOption(this.schedulingOptionId, payload);
    await this.loadReport();

    // try {
    //   if (this.isEditMode && this.schedulingOptionId) {
    //     await this.reportsService.updateSchedulingOption(this.schedulingOptionId, payload);
    //     this.scheduleOptionUpdated.emit();
    //   } else {
    //     const response = await this.reportsService.createSchedule(payload) as { uuid: string };
    //     this.router.navigate(['/edit-report', response.uuid]);
    //   }
    //   this.dialogRef.close();
    // } catch (e) {
    //   console.error(e);
    // }
  }


  onDatePresetChange(event: any) {
    console.log(event)
    this.schedulingOption!.datePreset = this.selectedDatePreset;
    this.updateSelectedDatePresetText();
  }

}

