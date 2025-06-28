import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {ActivatedRoute, Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component.js';
import { GetAvailableMetricsResponse, Metric, Metrics, ReportService } from 'src/app/services/api/report.service';
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
    reviewNeeded: false,
  };
  clientUuid: string = '';
  reportStatsLoading = true;

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

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private mockReportService: MockReportService,
    private reportsDataService: ReportsDataService
  ) {}

  async ngOnInit() {
    this.clientUuid = this.route.snapshot.paramMap.get('clientUuid') || '';

    this.availableMetrics = await this.reportService.getAvailableMetrics();

    this.reportSections = await this.reportsDataService.getInitiatedReportsSections(this.availableMetrics);

    this.reportSections.forEach(section => {
      for (let i = 0; i < 3; i++) {
        section.metrics[i].enabled = true;
      }
    });

    // console.log(this.reportSections)

    // this.initMetricSelections();
    this.mockData = this.mockReportService.generateMockData();
    this.reportStatsLoading = false;
  }

  ngOnChanges() {
    if (this.reportSections) {
      console.log(this.reportSections)
      this.reportSections.sort((a, b) => a.order - b.order);
    }
  }

  // private initMetricSelections(): void {

  //   const initSelection = (keys: string[], selectedMetrics: string[]) => keys.reduce((acc, k) => ({ ...acc, [k]: selectedMetrics.includes(k) }), {});

  //   this.metricSelections = {
  //     kpis: initSelection(this.availableMetrics.kpis, this.availableMetrics.kpis.slice(0, 4)),
  //     graphs: initSelection(this.availableMetrics.graphs, this.availableMetrics.graphs.slice(0, 4)),
  //     ads: initSelection(this.availableMetrics.ads, this.availableMetrics.ads.slice(0, 4)),
  //     campaigns: initSelection(this.availableMetrics.campaigns, this.availableMetrics.campaigns.slice(0, 4)),
  //   }

  // }

  dropSection(event: CdkDragDrop<ReportSection[]>): void {
    moveItemInArray(this.reportSections, event.previousIndex, event.currentIndex);

    this.reportSections.forEach((section, index) => {
      section.order = index + 1;
    });

    console.log(this.reportSections)
  }

  scheduleReportDelivery() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        reportSections: this.reportSections,
        clientUuid: this.clientUuid,
        // metricSelections: this.metricSelections,
        schedule: this.schedule,
        messages: {
          whatsapp: '',
          slack: '',
          email: {
            title: '',
            body: ''
          }
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadClientDetails();
    });
  }



}
