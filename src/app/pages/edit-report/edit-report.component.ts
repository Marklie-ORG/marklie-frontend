import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/api/report.service';

interface SchedulingOption {
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
  organizationUuid: string
}

interface Metrics {
  ads: string[]
  kpis: string[]
  graphs: string[]
  campaigns: string[]
}

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss'
})
export class EditReportComponent {

  schedulingOptionId: string | null = null;

  schedulingOption: SchedulingOption | null = null;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.schedulingOptionId = params['id'];
      await this.loadReport();
    });
  }

  private async loadReport() {
    if (!this.schedulingOptionId) return;
    this.schedulingOption = await this.reportService.getSchedulingOption(this.schedulingOptionId);
    console.log(this.schedulingOption);
    // this.scheduleOptions = this.client.crons || [];
  }

}

