import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';
import { Metric } from 'src/app/services/api/report.service';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';

@Component({
  selector: 'campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss'
})
export class CampaignTableComponent {
  
  @Input() reportSections: ReportSection[] = [];
  @Input() campaigns: any[] = [];

  metrics: Metric[] = [];

  constructor(public metricsService: MetricsService) {
    this.metrics = this.reportSections.find(s => s.key === 'campaigns')?.metrics || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportSections']) {
      this.metrics = this.reportSections.find(s => s.key === 'campaigns')?.metrics || [];
      // console.log(this.metrics)
    }
  }

  dropCampaignColumn(event: CdkDragDrop<string[]>): void {
    // moveItemInArray(this.campaignColumnOrder, event.previousIndex, event.currentIndex);
  }
  
}
