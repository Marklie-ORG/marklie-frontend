import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CreateScheduleRequest, Metrics, ReportService, Schedule } from 'src/app/services/api/report.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


type MetricSectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

interface ScheduleOptionsMatDialogData {
  panelToggles: Record<MetricSectionKey, boolean>;
  clientUuid: string;
  metricSelections: Record<MetricSectionKey, Record<string, boolean>>;
  schedule: any;
  isEditMode: boolean;
  datePreset: string;
  schedulingOptionId: string;
}

@Component({
  selector: 'schedule-options',
  templateUrl: './schedule-options.component.html',
  styleUrl: './schedule-options.component.scss'
})
export class ScheduleOptionsComponent {

  @Input() panelToggles: Record<MetricSectionKey, boolean> | undefined = undefined;
  @Input() clientUuid: string = '';
  @Input() metricSelections: Record<MetricSectionKey, Record<string, boolean>> | undefined = undefined;
  @Input() schedule: Schedule | undefined = undefined;
  @Input() isEditMode: boolean = false;

  @Output() scheduleOptionUpdated = new EventEmitter<void>();

  readonly DATE_PRESETS = [
    { value: 'today', text: 'Today' },
    { value: 'yesterday', text: 'Yesterday' },
    { value: 'this_month', text: 'This Month' },
    { value: 'last_month', text: 'Last Month' },
    { value: 'this_quarter', text: 'This Quarter' },
    { value: 'last_3d', text: 'Last 3 Days' },
    { value: 'last_7d', text: 'Last 7 Days' },
    { value: 'last_14d', text: 'Last 14 Days' },
    { value: 'last_28d', text: 'Last 28 Days' },
    { value: 'last_30d', text: 'Last 30 Days' },
    { value: 'last_90d', text: 'Last 90 Days' },
    { value: 'last_week_mon_sun', text: 'Last Week (Mon-Sun)' },
    { value: 'last_week_sun_sat', text: 'Last Week (Sun-Sat)' },
    { value: 'last_quarter', text: 'Last Quarter' },
    { value: 'last_year', text: 'Last Year' },
    { value: 'this_week_mon_today', text: 'This Week (Mon-Today)' },
    { value: 'this_week_sun_today', text: 'This Week (Sun-Today)' },
    { value: 'this_year', text: 'This Year' },
    { value: 'maximum', text: 'Maximum' }
  ];
  readonly DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  selectedDatePreset = this.DATE_PRESETS[6].value;
  schedulingOptionId: string = '';
  

  constructor(
    private reportsService: ReportService,
    private router: Router,
    public dialogRef: MatDialogRef<ScheduleOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleOptionsMatDialogData,
  ) {
    this.panelToggles = data.panelToggles;
    this.clientUuid = data.clientUuid;
    this.metricSelections = data.metricSelections;
    this.schedule = data.schedule;
    this.isEditMode = data.isEditMode;
    this.selectedDatePreset = this.isEditMode ? data.datePreset : this.DATE_PRESETS[6].value;
    this.schedulingOptionId = data.schedulingOptionId;
  }

  async saveConfiguration() {

    if (!this.panelToggles || !this.metricSelections) {
      return;
    }

    const metrics: Metrics = {
      kpis: [],
      graphs: [],
      ads: [],
      campaigns: []
    };

    (Object.keys(this.panelToggles) as MetricSectionKey[]).forEach(sectionKey => {
      if (this.panelToggles && this.panelToggles[sectionKey] && this.metricSelections) {
        metrics[sectionKey] = this.getSelected(this.metricSelections[sectionKey]);
      }
    });

    if (!this.schedule) {
      return;
    }

    const payload: CreateScheduleRequest = {
      ...(this.schedule),
      metrics,
      datePreset: this.selectedDatePreset,
      clientUuid: this.clientUuid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    try {
      if (this.isEditMode && this.schedulingOptionId) {
        await this.reportsService.updateSchedulingOption(this.schedulingOptionId, payload);
        this.scheduleOptionUpdated.emit();
      } else {
        await this.reportsService.createSchedule(payload);
      }
      this.dialogRef.close();
    } catch (e) {
      console.error(e);
    }
  }

  private getSelected(selection: Record<string, boolean>): string[] {
    return Object.keys(selection).filter(k => selection[k]);
  }
}
