import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';
import { Metric } from 'src/app/services/api/report.service';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import Sortable from 'sortablejs';

@Component({
  selector: 'campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss'
})
export class CampaignTableComponent implements OnDestroy {
  
  private sortable: Sortable | null = null;

  @ViewChild('campaignsHeaderContainer', { static: false }) set gridContainer(el: ElementRef | undefined) {
    if (this.sortable) {
      this.sortable.destroy();
      this.sortable = null;
    }

    if (el) {
      this.sortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        draggable: '.draggable-metric-header',
        onEnd: (event) => this.reorderItems(event),
      });
    }
  }

  @Input() reportSections: ReportSection[] = [];
  @Input() campaigns: any[] = [];

  metrics: Metric[] = [];
  enabledMetrics: Metric[] = [];

  constructor(public metricsService: MetricsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportSections']) {
      this.updateMetrics();
    }
  }

  updateMetrics() {
    this.metrics = this.reportSections.find(s => s.key === 'campaigns')?.metrics || [];
  }

  reorderItems(event: Sortable.SortableEvent) {
    
    const campaignsSection = this.reportSections.find(s => s.key === 'campaigns');
    if (campaignsSection) {
      const movedItem = campaignsSection.metrics.splice(event.oldIndex!, 1)[0];
      campaignsSection.metrics.splice(event.newIndex!, 0, movedItem);
    }
    campaignsSection?.metrics.forEach((m, index) => m.order = index);

    console.log(this.reportSections)
    this.updateMetrics();
  }
  
  ngOnDestroy(): void {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
  
}
