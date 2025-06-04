import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/api/report.service';

type MetricSectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

@Component({
  selector: 'schedule-options',
  templateUrl: './schedule-options.component.html',
  styleUrl: './schedule-options.component.scss'
})
export class ScheduleOptionsComponent {

  @Input() panelToggles: Record<MetricSectionKey, boolean> | undefined = undefined;
  @Input() clientUuid: string = '';
  @Input() metricSelections: Record<MetricSectionKey, Record<string, boolean>> | undefined = undefined;
  @Input() schedule: any = {};

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

  selectedDatePresetText = this.DATE_PRESETS[6].value;

  constructor(
    private reportsService: ReportService,
    private router: Router,
  ) {}

  async saveConfiguration() {

    if (!this.panelToggles || !this.metricSelections) {
      return;
    }

    const metrics: Partial<Record<MetricSectionKey, string[]>> = {};

    (Object.keys(this.panelToggles) as MetricSectionKey[]).forEach(sectionKey => {
      if (this.panelToggles && this.panelToggles[sectionKey] && this.metricSelections) {
        metrics[sectionKey] = this.getSelected(this.metricSelections[sectionKey]);
      }
    });

    const payload = {
      ...(this.schedule),
      metrics,
      datePreset: this.selectedDatePresetText,
      clientUuid: this.clientUuid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    try {
      await this.reportsService.createSchedule(payload);
      this.router.navigate(['/client', this.clientUuid]);
    } catch (e) {
      console.error(e);
    }
  }

  private getSelected(selection: Record<string, boolean>): string[] {
    return Object.keys(selection).filter(k => selection[k]);
  }
}
