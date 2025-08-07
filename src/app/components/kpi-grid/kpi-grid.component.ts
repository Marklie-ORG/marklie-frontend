import { Component, effect, ElementRef, input, Input, model, ViewChild } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount, Metric } from 'src/app/interfaces/interfaces.js';
import Sortable from 'sortablejs';

@Component({
  selector: 'kpi-grid',
  templateUrl: './kpi-grid.component.html',
  styleUrl: './kpi-grid.component.scss'
})
export class KpiGridComponent {

  private kpiGridSortable: Sortable | null = null;

  // @ViewChild('kpiGridContainer', { static: false }) set kpiGridContainer(el: ElementRef | undefined) {
  //   if (this.kpiGridSortable) {
  //     this.kpiGridSortable.destroy();
  //     this.kpiGridSortable = null;
  //   }

  //   if (el) {
  //     this.kpiGridSortable = Sortable.create(el.nativeElement, {
  //       animation: 200,
  //       easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  //       ghostClass: 'sortable-ghost',
  //       dragClass: 'sortable-drag',
  //       onEnd: (event) => this.reorderItems(event),
  //     });
  //   }

  //   if (this.isViewMode()) {
  //     this.kpiGridSortable?.option('disabled', true);
  //   }
  // }
  
  adAccounts = model<AdAccount[]>([]);

  kpis = input<any>({});
  isViewMode = input<boolean>(false);

  constructor(
    public metricsService: MetricsService
  ) {
    // effect(() => {
    //   console.log(this.adAccounts())
    // });
  }

  // reorderItems(event: Sortable.SortableEvent) {
  //   const metrics = this.metrics();

  //   if (metrics) {
  //     const movedItem = metrics.splice(event.oldIndex!, 1)[0];
  //     metrics.splice(event.newIndex!, 0, movedItem);
  //   }
  //   metrics.forEach((m, index) => m.order = index);

  //   this.metrics.set(metrics);
  // }

}
