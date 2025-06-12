import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MetricSectionKey, MockData } from 'src/app/pages/schedule-report/schedule-report.component';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

export interface MetricSelections {
  kpis: Record<string, boolean>;
  graphs: Record<string, boolean>;
  ads: Record<string, boolean>;
  campaigns: Record<string, boolean>;
}

@Component({
  selector: 'edit-report-content',
  templateUrl: './edit-report-content.component.html',
  styleUrl: './edit-report-content.component.scss'
})
export class EditReportContentComponent implements OnInit {

  @Input() reportSections: ReportSection[] = [];
  @Input() panelToggles: Record<MetricSectionKey, boolean> | undefined = undefined;

  @Input() metricSelections: MetricSelections | undefined = undefined;

  @Input() campaignColumnOrder: string[] = [];
  @Input() mockData: MockData | undefined = undefined;
  @Input() campaignAvailableMetrics: string[] = [];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // this.generateMockData();
  }

  dropKPICard(event: CdkDragDrop<string[]>): void {
    const kpiSection = this.reportSections.find(s => s.key === 'kpis');
    if (kpiSection) {
      moveItemInArray(kpiSection.metrics, event.previousIndex, event.currentIndex);
    }
  }

}
