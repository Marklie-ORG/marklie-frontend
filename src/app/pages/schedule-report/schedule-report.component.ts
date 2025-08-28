import { Component, inject, model, OnInit, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import {ActivatedRoute, Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component.js';
import { ReportService } from 'src/app/services/api/report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import { ScheduleReportRequest, Frequency, Messages, FACEBOOK_DATE_PRESETS } from 'src/app/interfaces/interfaces.js';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { NotificationService } from '@services/notification.service';

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

  frequency: Frequency = 'weekly';
  time: string = '09:00';
  dayOfWeek: string = 'Monday';
  dayOfMonth: number = 1;
  intervalDays: number = 1;
  cronExpression: string = '';
  reviewRequired: boolean = true;
  clientUuid: string = '';
  reportStatsLoading = signal(true);

  reportSections = model<ReportSection[]>([]);

  reportTitle: string = 'Report Title';

  selectedDatePreset: FACEBOOK_DATE_PRESETS = FACEBOOK_DATE_PRESETS.LAST_7D;

  selectedDatePresetText: string = '';

  messages: Messages = {
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
  public reportsDataService = inject(ReportsDataService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.updateSelectedDatePresetText();
  }

  onDatePresetChange(event: any) {
    this.updateSelectedDatePresetText();
  }

  async ngOnInit() {
    this.clientUuid = this.route.snapshot.paramMap.get('clientUuid') || '';

    this.reportSections.set(await this.reportsDataService.getDefaultReportsSections(this.clientUuid));

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
        frequency: this.frequency,
        time: this.time,
        dayOfWeek: this.dayOfWeek,
        dayOfMonth: this.dayOfMonth,
        intervalDays: this.intervalDays,
        cronExpression: this.cronExpression,
        reviewRequired: this.reviewRequired,
        messages: this.messages
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.frequency = result.frequency;
      this.time = result.time;
      this.dayOfWeek = result.dayOfWeek;
      this.dayOfMonth = result.dayOfMonth;
      this.intervalDays = result.intervalDays;
      this.cronExpression = result.cronExpression;
      this.reviewRequired = result.reviewRequired;
      this.messages = result.messages;
      this.updateSelectedDatePresetText();

      this.scheduleReport();
    });
  }

  async scheduleReport() {
    if (!this.reportSections) {
      return;
    }

    const providers = this.reportsDataService.getProviders(this.reportSections());

    console.log(providers)

    const payload: ScheduleReportRequest = {
      reportName: this.reportTitle,
      frequency: this.frequency,
      time: this.time,
      dayOfWeek: this.dayOfWeek,
      dayOfMonth: this.dayOfMonth,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      intervalDays: this.intervalDays,
      cronExpression: this.cronExpression,
      datePreset: this.selectedDatePreset,
      clientUuid: this.clientUuid,
      messages: this.messages,
      images: {
        clientLogo: this.clientImageGsUri(),
        organizationLogo: this.agencyImageGsUri()
      },
      organizationUuid: '',
      reviewRequired: this.reviewRequired,
      providers: providers
    };

    const response = await this.reportService.scheduleReport(payload) as { uuid: string };
    this.notificationService.info('Report scheduled successfully');
    this.router.navigate([`/client/${this.clientUuid}`]);
  }

}
