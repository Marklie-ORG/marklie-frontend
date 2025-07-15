import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { Daum, ReportService } from '../../services/api/report.service.js';
import { ReportsDataService } from '../../services/reports-data.service.js';
import { ReportSection } from '../schedule-report/schedule-report.component.js';

export interface AllReportData {
  data: Daum[];
  reportTitle?: string;
  metadata?: any;
}

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss'],
})
export class ViewReportComponent implements OnInit, OnDestroy {
  private reportService = inject(ReportService);
  private reportDataService = inject(ReportsDataService);
  private route = inject(ActivatedRoute);

  reportStatsLoading = false;
  private chartInstances: Record<string, Chart> = {};

  reportData = signal<AllReportData | null>(null);
  selectedAccountIndex = signal<number>(-1);
  reportSections = signal<ReportSection[]>([]);


  selectedData = computed<Daum | null>(() => {
    const data = this.reportData()?.data;
    const index = this.selectedAccountIndex();

    if (!data || !Array.isArray(data)) return null;
    return index === -1
      ? this.reportDataService.aggregateReports(data)
      : data[index];
  });


  async ngOnInit(): Promise<void> {
    const reportUuid = this.route.snapshot.params['uuid'];
    if (reportUuid) {
      await this.loadReport(reportUuid);
    }
  }

  ngOnDestroy(): void {
    Object.values(this.chartInstances).forEach((chart) => chart.destroy());
  }

  async loadReport(uuid: string): Promise<void> {
    this.reportStatsLoading = true;
    try {
      const res = await this.reportService.getReport(uuid);
      const availableMetrics = await this.reportService.getAvailableMetrics();

      console.log(res);
      this.reportData.set({
        data: res.data,
        reportTitle: 'Test',
        metadata: res.metadata,
      });

      const sections = await this.reportDataService.getInitiatedReportsSections(
        availableMetrics,
        res.metadata
      );

      this.reportSections.set(sections);
      this.selectedAccountIndex.set(-1);
    } catch (error) {
      console.error('Error loading view-report:', error);
    } finally {
      this.reportStatsLoading = false;
    }
  }

}
