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
        filter: '.non-sortable',
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
    const oldIndex = event.oldIndex! - 2; // because there are 2 non-sortable columns in container (two first <th>)
    const newIndex = event.newIndex! - 2;
    const enabledMetrics = this.metrics.filter(m => m.enabled);
    const movedItem = enabledMetrics.splice(oldIndex, 1)[0];
    enabledMetrics.splice(newIndex, 0, movedItem);
    enabledMetrics?.forEach((m, index) => m.order = index);

    const disabledMetrics = this.metrics.filter(m => !m.enabled);
    disabledMetrics.forEach((m, index) => m.order = index + enabledMetrics.length);

    this.metrics = [...enabledMetrics, ...disabledMetrics];
  }
  
  ngOnDestroy(): void {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
  
}
