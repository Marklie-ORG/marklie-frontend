import { Component, inject, model, OnInit, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import {ActivatedRoute, Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component.js';
import { ReportService } from 'src/app/services/api/report.service';
import { MockReportService } from 'src/app/services/mock-report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import {SchedulesService} from "../../services/api/schedules.service.js";
import { CreateScheduleRequest, GetAvailableMetricsResponse, ReportSection } from 'src/app/interfaces/interfaces.js';

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
  private schedulesService = inject(SchedulesService);

  schedule = {
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 'Monday',
    dayOfMonth: 1,
    intervalDays: 1,
    cronExpression: '',
    reviewNeeded: false,
  };
  clientUuid: string = '';
  reportStatsLoading = signal(true);

  mockData: Data = {
    KPIs: {},
    ads: [],
    campaigns: [],
    graphs: []
  }

  reportSections = model<ReportSection[]>([]);

  availableMetrics: GetAvailableMetricsResponse = {};

  reportTitle: string = 'Report Title';

  selectedDatePreset: string = 'last_7d';

  selectedDatePresetText: string = '';

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

  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);
  private mockReportService = inject(MockReportService);
  public reportsDataService = inject(ReportsDataService);

  constructor() {
    this.updateSelectedDatePresetText();
  }

  onDatePresetChange(event: any) {
    this.updateSelectedDatePresetText();
  }

  async ngOnInit() {
    this.clientUuid = this.route.snapshot.paramMap.get('clientUuid') || '';

    this.reportSections.set(await this.reportsDataService.getInitiatedReportsSections(this.clientUuid));

    // console.log(this.reportSections)

    // return

    // this.reportSections.forEach(section => {
    //   for (let i = 0; i < 3; i++) {
    //     section.metrics[i].enabled = true;
    //   }
    // });

    this.mockData = this.mockReportService.generateMockData();

    this.reportStatsLoading.set(false);
  }

  ngOnChanges() {
    if (this.reportSections) {
      console.log(this.reportSections)
      this.reportSections.update(prev => prev.sort((a, b) => a.order - b.order));
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

  editScheduleConfiguration() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        reportSections: this.reportSections,
        clientUuid: this.clientUuid,
        schedule: this.schedule,
        messages: this.messages,
        datePreset: this.selectedDatePreset,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
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

    const selections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections());

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
        organizationLogo: this.agencyImageGsUri()
      }
    };

    const response = await this.reportService.createSchedule(payload) as { uuid: string };
    this.router.navigate([`/client/${this.clientUuid}`]);
  }

}
