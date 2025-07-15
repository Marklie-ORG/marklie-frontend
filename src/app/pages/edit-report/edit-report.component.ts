import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MockReportService } from 'src/app/services/mock-report.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import {Metric, ReportService} from 'src/app/services/api/report.service';
import {
  CreateScheduleRequest,
  GetAvailableMetricsResponse,
  Schedule,
} from 'src/app/services/api/report.service';
import { Data, ReportSection } from '../schedule-report/schedule-report.component';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component';

@Component({
  selector: 'app-edit-view-report',
  templateUrl: './edit-report.component.html',
  styleUrls: ['./edit-report.component.scss'],
})
export class EditReportPage {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private reportService = inject(ReportService);
  private mockReportService = inject(MockReportService);
  public reportsDataService = inject(ReportsDataService);

  reportStatsLoading = signal(false);
  isPreviewMode = signal(false);
  changesMade = signal(false);

  schedulingOptionId = signal<string | null>(null);
  schedulingOption = signal<any | null>(null);
  reportSections = signal<ReportSection[]>([]);
  mockData = signal<Data>(this.mockReportService.generateMockData());

  reportTitle = signal<string | undefined>(undefined);
  selectedDatePreset = signal<string>('');
  selectedDatePresetText = signal<string>('');

  clientUuid = '';


  constructor() {
      const params = this.route.snapshot.params;
      this.schedulingOptionId.set(params['schedulingOptionId']);
      this.init();

  }



  private async init() {
    if (!this.schedulingOptionId()) return;

    this.reportStatsLoading.set(true);
    const availableMetrics: GetAvailableMetricsResponse =
      await this.reportService.getAvailableMetrics();
    const option = await this.reportService.getSchedulingOption(this.schedulingOptionId() as string);

    this.schedulingOption.set(option);
    const sections = await this.reportsDataService.getInitiatedReportsSections(availableMetrics);

    this.reportSections.set(this.populateSectionsFromOption(sections, option));
    this.mockData.set(this.mockReportService.generateMockData());

    console.log(this.reportSections())

    this.reportTitle.set(option.reportName);
    this.selectedDatePreset.set(option.datePreset);
    this.updateSelectedDatePresetText();
    this.reportStatsLoading.set(false);
  }

  private populateSectionsFromOption(sections: ReportSection[], option: any): ReportSection[] {
    const selectedMetrics = option.jobData.metrics;
    return sections.map(section => {
      const enabledMetrics = selectedMetrics[section.key]?.metrics || [];
      section.enabled = enabledMetrics.length > 0;
      section.metrics.forEach(metric => {
        metric.enabled = enabledMetrics.some((m: Metric) => m.name === metric.name);
      });
      return section;
    });
  }

  updateSelectedDatePresetText() {
    const preset = this.reportsDataService.DATE_PRESETS.find(p => p.value === this.selectedDatePreset());
    this.selectedDatePresetText.set(preset?.text ?? '');
  }

  onDatePresetChange(value: string) {
    this.selectedDatePreset.set(value);
    if (this.schedulingOption()) {
      this.schedulingOption.update(opt => ({
        ...opt!,
        datePreset: value
      }));
      this.updateSelectedDatePresetText();
    }
  }

  editScheduleConfiguration() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        reportSections: this.reportSections(),
        clientUuid: this.clientUuid,
        schedule: this.schedulingOption()?.jobData,
        messages: this.schedulingOption()?.jobData.messages,
        datePreset: this.selectedDatePreset()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const option = this.schedulingOption();
      if (option) {
        this.schedulingOption.set({
          ...option,
          datePreset: result.datePreset,
          jobData: {
            ...option.jobData,
            messages: result.messages
          }
        });
        this.selectedDatePreset.set(result.datePreset);
        this.updateSelectedDatePresetText();
        this.saveConfiguration();
      }
    });
  }

  async saveConfiguration() {
    if (!this.schedulingOptionId() || !this.schedulingOption()) return;

    const selections = this.reportsDataService.reportSectionsToMetricsSelections(this.reportSections());

    const payload: CreateScheduleRequest = {
      ...(this.scheduleFromOption(this.schedulingOption()!)),
      metrics: selections,
      datePreset: this.selectedDatePreset(),
      clientUuid: this.clientUuid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      messages: this.schedulingOption()!.jobData.messages
    };

    await this.reportService.updateSchedulingOption(this.schedulingOptionId()!, payload);
    await this.init();
  }

  private scheduleFromOption(option: any): Schedule {
    const jd = option.jobData;
    return {
      reportName: option.reportName,
      frequency: jd.frequency,
      time: jd.time,
      dayOfWeek: jd.dayOfWeek,
      dayOfMonth: jd.dayOfMonth,
      intervalDays: jd.intervalDays,
      cronExpression: option.cronExpression,
      reviewNeeded: option.reviewNeeded
    };
  }
}
