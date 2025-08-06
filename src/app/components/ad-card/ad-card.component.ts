import { Component, ElementRef, Input, AfterViewInit, OnDestroy, QueryList, ViewChildren, input, model } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount, Metric } from 'src/app/interfaces/interfaces.js';
import Sortable from 'sortablejs';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent implements AfterViewInit, OnDestroy {

  private sortables: Sortable[] = [];

  @ViewChildren('adsGridContainer') gridContainers!: QueryList<ElementRef>;
  
  @Input() ads: any[] = [];
  adAccounts = model<AdAccount[]>([]);
  isViewMode = input<boolean>(false);

  constructor(public metricsService: MetricsService) {
  }

  ngAfterViewInit(): void {
    this.initSortables();
    this.gridContainers.changes.subscribe(() => {
      this.initSortables();
    });
  }

  ngOnDestroy(): void {
    this.destroySortables();
  }

  private initSortables(): void {
    // this.destroySortables();
    // this.gridContainers.forEach(container => {
    //   this.sortables.push(Sortable.create(container.nativeElement, {
    //     group: 'ad-metrics',
    //     animation: 200,
    //     easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    //     ghostClass: 'sortable-ghost',
    //     dragClass: 'sortable-drag',
    //     onEnd: (event) => this.reorderItems(event),
    //   }));
    // });

    // if (this.isViewMode()) {
    //   this.sortables.forEach(s => s.option('disabled', true));
    // }
  }

  private destroySortables(): void {
    this.sortables.forEach(s => s.destroy());
    this.sortables = [];
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  // reorderItems(event: Sortable.SortableEvent) {
  //   let metrics = this.metrics();
  //   if (metrics) {
  //     const movedItem = metrics.splice(event.oldIndex!, 1)[0];
  //     metrics.splice(event.newIndex!, 0, movedItem);
  //   }
  //   metrics.forEach((m, index) => m.order = index);
  //   this.metrics.set(metrics);
  // }

}
