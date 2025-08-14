import { Component, ElementRef, Input, AfterViewInit, OnDestroy, QueryList, ViewChildren, input, model } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';
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
    this.destroySortables();
    this.gridContainers.forEach(containerRef => {
      const containerEl = containerRef.nativeElement as HTMLElement;
      const adAccountId = containerEl.dataset['adAccountId'] ?? 'default';
      const sortable = Sortable.create(containerEl, {
        group: { name: `ad-metrics-${adAccountId}`, pull: false, put: false },
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        draggable: '.metric.enabled',
        onEnd: (event) => this.reorderItems(event)
      });
      this.sortables.push(sortable);
    });

    if (this.isViewMode()) {
      this.sortables.forEach(s => s.option('disabled', true));
    }
  }

  private destroySortables(): void {
    this.sortables.forEach(s => s.destroy());
    this.sortables = [];
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  private reorderItems(event: Sortable.SortableEvent) {
    const containerEl = event.from as HTMLElement;
    const adAccountId = containerEl.dataset['adAccountId'];
    if (!adAccountId) return;

    const accounts = this.adAccounts();
    const account = accounts.find(a => a.id === adAccountId);
    if (!account) return;

    const enabledOrderFromDom: string[] = Array.from(containerEl.querySelectorAll('.metric.enabled'))
      .map(el => (el as HTMLElement).dataset['metricName']!)
      .filter(Boolean);

    if (enabledOrderFromDom.length === 0) return;

    const enabledByName = new Map<string, Metric>();
    for (const m of account.metrics) {
      if (m.enabled) enabledByName.set(m.name, m);
    }

    const enabledMetricsReordered: Metric[] = [];
    for (const name of enabledOrderFromDom) {
      const m = enabledByName.get(name);
      if (m) enabledMetricsReordered.push({ ...m });
    }

    const reordered: Metric[] = [];
    let enabledPtr = 0;
    for (const metric of account.metrics) {
      if (metric.enabled) {
        reordered.push({ ...enabledMetricsReordered[enabledPtr++] });
      } else {
        reordered.push({ ...metric });
      }
    }

    reordered.forEach((m, idx) => m.order = idx);

    const updatedAccounts = accounts.map(a => a.id === adAccountId ? ({ ...a, metrics: reordered }) : a);
    this.adAccounts.set(updatedAccounts);
  }

}
