import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { MockData, ReportSection } from '../schedule-report/schedule-report.component';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MetricSelections } from 'src/app/components/edit-report-content/edit-report-content.component';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component';
import { MockReportService } from 'src/app/services/mock-report.service';

export interface SchedulingOption {
  uuid: string
  createdAt: string
  updatedAt: string
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

  metricSelections: MetricSelections = {
    kpis: {} as Record<string, boolean>,
    graphs: {} as Record<string, boolean>,
    ads: {} as Record<string, boolean>,
    campaigns: {} as Record<string, boolean>
  };

  panelToggles = {
    kpis: true,
    graphs: true,
    ads: true,
    campaigns: true
  };

  metricsGraphConfig: any[] = [];

  mockData: MockData = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  schedulingOptionId: string | null = null;

  schedulingOption: SchedulingOption | null = null;

  availableMetrics: Metrics = {
    kpis: [],
    graphs: [],
    ads: [],
    campaigns: []
  };

  reportSections: ReportSection[] = []

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private mockReportService: MockReportService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.schedulingOptionId = params['schedulingOptionId'];

      this.availableMetrics = await this.reportService.getAvailableMetrics();
      // this.availableMetrics = {
      //   kpis: ['spend', 'impressions', 'clicks', 'cpc', 'ctr', 'actions', 'action_values', 'purchase_roas', 'reach'],
      //   graphs: ['spend', 'impressions', 'clicks', 'cpc', 'ctr', 'purchaseRoas', 'conversionValue', 'purchases', 'addToCart', 'initiatedCheckouts', 'costPerPurchase', 'costPerCart'],
      //   ads: ['spend', 'addToCart', 'purchases', 'roas'],
      //   campaigns: ['spend', 'purchases', 'conversionRate', 'purchaseRoas'],
      // }

      this.reportSections = [
        { key: 'kpis', title: 'KPIs', enabled: true, metrics: this.availableMetrics.kpis },
        { key: 'graphs', title: 'Graphs', enabled: true, metrics: this.availableMetrics.graphs },
        { key: 'ads', title: 'Ads', enabled: true, metrics: this.availableMetrics.ads },
        { key: 'campaigns', title: 'Campaigns', enabled: true, metrics: this.availableMetrics.campaigns }
      ];

      console.log(this.reportSections)

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
      frequency: schedulingOption.jobData.frequency,
      time: schedulingOption.jobData.time,
      dayOfWeek: schedulingOption.jobData.dayOfWeek,
      dayOfMonth: schedulingOption.jobData.dayOfMonth,
      intervalDays: schedulingOption.jobData.intervalDays,
      cronExpression: schedulingOption.cronExpression,
      reviewNeeded: schedulingOption.reviewNeeded,
    };

    this.panelToggles = {
      kpis: schedulingOption.jobData.metrics.kpis.length > 0,
      graphs: schedulingOption.jobData.metrics.graphs.length > 0,
      ads: schedulingOption.jobData.metrics.ads.length > 0,
      campaigns: schedulingOption.jobData.metrics.campaigns.length > 0
    }

    this.metricSelections = {
      kpis: initSelection(this.availableMetrics.kpis, schedulingOption.jobData.metrics.kpis),
      graphs: initSelection(this.availableMetrics.graphs, schedulingOption.jobData.metrics.graphs),
      ads: initSelection(this.availableMetrics.ads, schedulingOption.jobData.metrics.ads),
      campaigns: initSelection(this.availableMetrics.campaigns, schedulingOption.jobData.metrics.campaigns),
    }

    console.log(this.metricSelections)

  }

  editDelivery() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        panelToggles: this.panelToggles,
        clientUuid: this.clientUuid,
        metricSelections: this.metricSelections,
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

