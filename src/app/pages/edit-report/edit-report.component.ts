import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetAvailableMetricsResponse, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { MockData, ReportSection } from '../schedule-report/schedule-report.component';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

  mockData: MockData = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  schedulingOptionId: string | null = null;

  schedulingOption: SchedulingOption | null = null;

  availableMetrics: GetAvailableMetricsResponse = {};

  reportSections: ReportSection[] = []

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private mockReportService: MockReportService,
    private reportsDataService: ReportsDataService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.schedulingOptionId = params['schedulingOptionId'];

      this.availableMetrics = await this.reportService.getAvailableMetrics();

      this.reportSections = await this.reportsDataService.getInitiatedReportsSections(this.availableMetrics);

      await this.loadReport();

    });
  }

  private async loadReport() {
    if (!this.schedulingOptionId) return;
    this.schedulingOption = await this.reportService.getSchedulingOption(this.schedulingOptionId) as SchedulingOption;
    this.convertOptionIntoTemplate(this.schedulingOption);
    this.mockData = this.mockReportService.generateMockData();
  }

  convertOptionIntoTemplate(schedulingOption: SchedulingOption) {

    const initSelection = (keys: string[], selectedMetrics: string[]) => keys.reduce((acc, k) => ({ ...acc, [k]: selectedMetrics.includes(k) }), {});

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
      console.log(section);

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

    dialogRef.componentInstance.scheduleOptionUpdated.subscribe(async () => {
      await this.loadReport();
    });
  }

  dropSection(event: CdkDragDrop<ReportSection[]>): void {
    moveItemInArray(this.reportSections, event.previousIndex, event.currentIndex);
  }

}

