import { Component, ElementRef, inject, input, Input, model, OnDestroy, ViewChild } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { Metric } from 'src/app/services/api/report.service';
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

    if (this.isViewMode()) {
      this.sortable?.option('disabled', true);
    }
  }

  @Input() campaigns: any[] = [];
  metrics = model<Metric[]>([]);
  isViewMode = input<boolean>(false);

  enabledMetrics: Metric[] = [];

  public metricsService = inject(MetricsService);

  reorderItems(event: Sortable.SortableEvent) {
    const oldIndex = event.oldIndex! - 2; // because there are 2 non-sortable columns in container (two first <th>)
    const newIndex = event.newIndex! - 2;
    const enabledMetrics = this.metrics().filter(m => m.enabled);
    const movedItem = enabledMetrics.splice(oldIndex, 1)[0];
    enabledMetrics.splice(newIndex, 0, movedItem);
    enabledMetrics?.forEach((m, index) => m.order = index);

    const disabledMetrics = this.metrics().filter(m => !m.enabled);
    disabledMetrics.forEach((m, index) => m.order = index + enabledMetrics.length);

    this.metrics.set([...enabledMetrics, ...disabledMetrics]);
  }
  
  ngOnDestroy(): void {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
  
}
