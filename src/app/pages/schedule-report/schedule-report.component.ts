import { Component, effect, model, OnInit, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {ActivatedRoute, Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component.js';
import { CreateScheduleRequest, GetAvailableMetricsResponse, Metric, Metrics, ReportService } from 'src/app/services/api/report.service';
import { MockReportService } from 'src/app/services/mock-report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';

export type MetricSectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

export interface ReportSection {
  key: MetricSectionKey;
  title: string;
  enabled: boolean;
  metrics: Metric[];
  order: number;
}

export interface Data {
  KPIs: Record<string, any>;
  ads: any[];
  campaigns: any[];
  graphs: any[];
}



@Component({
  selector: 'schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('250ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-out', style({ opacity: 0 }))])
    ])
  ]
})
export class ScheduleReportComponent implements OnInit {

  schedule = {
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 'Monday',
    dayOfMonth: 1,
    intervalDays: 1,
    cronExpression: '',
    reviewRequired: false,
  };
  clientUuid: string = '';
  reportStatsLoading = signal(true);

  metricsGraphConfig: any[] = [];

  mockData: Data = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  reportSections: ReportSection[] = []

  availableMetrics: GetAvailableMetricsResponse = {};

  reportTitle: string = 'Report Title';

  selectedDatePreset: string = 'last_7d';

  selectedDatePresetText: string | undefined = undefined;

  messages: {
    whatsapp: string,
    slack: string,
    email: {
      title: string,
      body: string,
    }
  } = {
    whatsapp: '',
    slack: '',
    email: {
      title: '',
      body: ''
    }
  }

  clientImageGsUri = signal<string>('');
  agencyImageGsUri = signal<string>('');

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private mockReportService: MockReportService,
    public reportsDataService: ReportsDataService,
    private reportsService: ReportService
  ) {
    // this.selectedDatePresetText = this.reportsDataService.DATE_PRESETS.find(preset => preset.value === this.selectedDatePreset)?.text || '';
    this.updateSelectedDatePresetText();

    // effect(() => {
    //   console.log(`The count is: ${this.clientImageGsUri()}`);
    // });
  }

  onDatePresetChange(event: any) {
    console.log(event)
    this.updateSelectedDatePresetText();
  }

  async ngOnInit() {
    this.clientUuid = this.route.snapshot.paramMap.get('clientUuid') || '';

    this.availableMetrics = await this.reportService.getAvailableMetrics();

    this.reportSections = await this.reportsDataService.getInitiatedReportsSections(this.availableMetrics);

    this.reportSections.forEach(section => {
      for (let i = 0; i < 3; i++) {
        section.metrics[i].enabled = true;
      }
    });

    this.mockData = this.mockReportService.generateMockData();

    this.reportStatsLoading.set(false);
    // this.reportStatsLoading = false;

    // this.editScheduleConfiguration();
  }

  ngOnChanges() {
    if (this.reportSections) {
      console.log(this.reportSections)
      this.reportSections.sort((a, b) => a.order - b.order);
    }
    if (this.selectedDatePreset) {
      this.updateSelectedDatePresetText();
    }
  }

  updateSelectedDatePresetText() {
    if (this.selectedDatePreset) {
      this.selectedDatePresetText = this.reportsDataService.DATE_PRESETS.find(preset => preset.value === this.selectedDatePreset)?.text || '';
    }
  }

  dropSection(event: CdkDragDrop<ReportSection[]>): void {
    moveItemInArray(this.reportSections, event.previousIndex, event.currentIndex);

    this.reportSections.forEach((section, index) => {
      section.order = index + 1;
    });

    console.log(this.reportSections)
  }

  editScheduleConfiguration() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        reportSections: this.reportSections,
        clientUuid: this.clientUuid,
        // metricSelections: this.metricSelections,
        schedule: this.schedule,
        messages: this.messages,
        datePreset: this.selectedDatePreset,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (!result) {
        return;
      }
      
      this.schedule = result.schedule;
      this.selectedDatePreset = result.datePreset;
      this.messages = result.messages;
      this.updateSelectedDatePresetText();

      this.saveConfiguration();
    });
  }

  async saveConfiguration() {
    if (!this.reportSections || !this.schedule) {
      return;
    }

    const selections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections);

    const payload: CreateScheduleRequest = {
      reportName: this.reportTitle,
      ...(this.schedule),
      metrics: selections,
      datePreset: this.selectedDatePreset,
      clientUuid: this.clientUuid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      messages: this.messages,
      images: {
        clientLogo: this.clientImageGsUri(),
        agencyLogo: this.agencyImageGsUri()
      }
    };

    const response = await this.reportsService.createSchedule(payload) as { uuid: string };
    this.router.navigate([`/client/${this.clientUuid}`]);
  }

}
