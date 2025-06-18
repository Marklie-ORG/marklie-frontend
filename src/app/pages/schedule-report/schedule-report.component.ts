import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {ActivatedRoute, Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { ScheduleOptionsComponent } from 'src/app/components/schedule-options/schedule-options.component.js';
import { Metrics, ReportService } from 'src/app/services/api/report.service';
import { MockReportService } from 'src/app/services/mock-report.service';

export type MetricSectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

export interface ReportSection {
  key: MetricSectionKey;
  title: string;
  enabled: boolean;
  metrics: string[];
}

export interface MockData {
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

  metricSelections = {
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

  reportSections: ReportSection[] = []

  availableMetrics: Metrics = {
    kpis: [],
    graphs: [],
    ads: [],
    campaigns: []
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private mockReportService: MockReportService
  ) {}

  async ngOnInit() {
    this.clientUuid = this.route.snapshot.paramMap.get('clientUuid') || '';

    this.availableMetrics = await this.reportService.getAvailableMetrics();

    this.reportSections = [
      { key: 'kpis', title: 'KPIs', enabled: true, metrics: this.availableMetrics.kpis },
      { key: 'graphs', title: 'Graphs', enabled: true, metrics: this.availableMetrics.graphs },
      { key: 'ads', title: 'Ads', enabled: true, metrics: this.availableMetrics.ads },
      { key: 'campaigns', title: 'Campaigns', enabled: true, metrics: this.availableMetrics.campaigns }
    ];

    this.initMetricSelections();
    this.generateMockData();
    this.reportStatsLoading = false;
  }

  private initMetricSelections(): void {

    const initSelection = (keys: string[], selectedMetrics: string[]) => keys.reduce((acc, k) => ({ ...acc, [k]: selectedMetrics.includes(k) }), {});

    this.metricSelections = {
      kpis: initSelection(this.availableMetrics.kpis, this.availableMetrics.kpis.slice(0, 4)),
      graphs: initSelection(this.availableMetrics.graphs, this.availableMetrics.graphs.slice(0, 4)),
      ads: initSelection(this.availableMetrics.ads, this.availableMetrics.ads.slice(0, 4)),
      campaigns: initSelection(this.availableMetrics.campaigns, this.availableMetrics.campaigns.slice(0, 4)),
    }


  }

  private generateMockData(): void {
    this.mockData = this.mockReportService.generateMockData();
  }

  dropSection(event: CdkDragDrop<ReportSection[]>): void {
    moveItemInArray(this.reportSections, event.previousIndex, event.currentIndex);
  }

  scheduleReportDelivery() {
    const dialogRef = this.dialog.open(ScheduleOptionsComponent, {
      width: '800px',
      data: {
        panelToggles: this.panelToggles,
        clientUuid: this.clientUuid,
        metricSelections: this.metricSelections,
        schedule: this.schedule
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadClientDetails();
    });
  }



}
