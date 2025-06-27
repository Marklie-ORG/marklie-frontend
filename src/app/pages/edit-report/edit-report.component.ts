import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetAvailableMetricsResponse, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
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

      

      await this.loadReport();

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
      console.log(section);

      section.enabled = schedulingOption.jobData.metrics[section.key].metrics.length > 0;
      section.metrics.forEach(metric => {
        metric.enabled = schedulingOption.jobData.metrics[section.key].metrics.some(m => m.name === metric.name);
      });
      // section.metrics.forEach(metric => {
      //   const metricIndex = schedulingOption.jobData.metrics[section.key].metrics.findIndex(m => m.name === metric.name);
      //   metric.order = metricIndex;
      // });
    });

    console.log(this.reportSections)

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

}

