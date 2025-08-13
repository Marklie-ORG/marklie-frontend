import { Component, effect, ElementRef, input, Input, model, ViewChildren, QueryList, OnDestroy, AfterViewInit, computed } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount } from 'src/app/interfaces/report-sections.interfaces';
import Sortable from 'sortablejs';
import type { Metric } from 'src/app/interfaces/report-sections.interfaces';
import { NgZone, inject } from '@angular/core';

@Component({
  selector: 'kpi-grid',
  templateUrl: './kpi-grid.component.html',
  styleUrl: './kpi-grid.component.scss'
})
export class KpiGridComponent implements AfterViewInit, OnDestroy {

  private sortablesByAdAccountId: Map<string, Sortable> = new Map();

  @ViewChildren('kpiGridContainer') kpiGridContainers!: QueryList<ElementRef<HTMLElement>>;
  
  adAccounts = model<AdAccount[]>([]);

  kpis = input<any>({});
  isViewMode = input<boolean>(false);

  constructor(
    public metricsService: MetricsService
  ) {
    // react to view mode changes and toggle sortable instances
    effect(() => {
      const disabled = this.isViewMode();
      queueMicrotask(() => {
        this.sortablesByAdAccountId.forEach((s) => s.option('disabled', disabled));
      });
    });
  }

  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    this.initializeSortables();

    // Re-initialize when the containers list changes (e.g., ad accounts updated)
    this.kpiGridContainers.changes.subscribe(() => {
      this.destroyAllSortables();
      this.initializeSortables();
    });
  }

  ngOnDestroy(): void {
    this.destroyAllSortables();
  }

  private initializeSortables(): void {
    const disableDragging = this.isViewMode();

    this.kpiGridContainers.forEach((containerRef: ElementRef<HTMLElement>) => {
      const containerEl = containerRef.nativeElement;
      const adAccountId = containerEl.getAttribute('data-adaccount-id') || '';

      const existing = this.sortablesByAdAccountId.get(adAccountId);
      if (existing) {
        existing.destroy();
        this.sortablesByAdAccountId.delete(adAccountId);
      }

      const sortable = this.ngZone.runOutsideAngular(() => Sortable.create(containerEl, {
        animation: 150,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        group: { name: `ad-account-${adAccountId}`, pull: false, put: false },
        handle: '.kpi-card',
        draggable: '.kpi-card:not(.disabled)',
        filter: '.disabled',
        preventOnFilter: true,
        disabled: disableDragging,
        onEnd: (event) => this.ngZone.run(() => this.onReorderEnd(event, adAccountId)),
      }));

      this.sortablesByAdAccountId.set(adAccountId, sortable);
    });
  }

  private destroyAllSortables(): void {
    this.sortablesByAdAccountId.forEach((s) => s.destroy());
    this.sortablesByAdAccountId.clear();
  }

  private onReorderEnd(event: Sortable.SortableEvent, adAccountId: string): void {
    const currentAdAccounts = [...this.adAccounts()];
    const accountIndex = currentAdAccounts.findIndex(a => String(a.id) === String(adAccountId));
    if (accountIndex < 0) return;

    const adAccount = { ...currentAdAccounts[accountIndex] } as AdAccount;
    const allMetrics: Metric[] = [...adAccount.metrics];

    // Enabled metrics and their positions within the full array
    const enabledPositions: number[] = [];
    const enabledMetrics: Metric[] = [];
    for (let i = 0; i < allMetrics.length; i++) {
      if (allMetrics[i].enabled) {
        enabledPositions.push(i);
        enabledMetrics.push({ ...allMetrics[i] });
      }
    }

    // Use draggable indices (among enabled items). Fallback to oldIndex/newIndex.
    const oldIdx = (event as any).oldDraggableIndex ?? event.oldIndex ?? 0;
    const newIdx = (event as any).newDraggableIndex ?? event.newIndex ?? 0;

    if (oldIdx !== newIdx) {
      const moved = enabledMetrics.splice(oldIdx, 1)[0];
      enabledMetrics.splice(newIdx, 0, moved);
    }

    // Rebuild result metrics keeping disabled in place
    const resultMetrics: Metric[] = allMetrics.map(m => ({ ...m }));
    for (let i = 0; i < enabledPositions.length; i++) {
      const pos = enabledPositions[i];
      resultMetrics[pos] = { ...enabledMetrics[i] };
    }

    // Assign sequential order across all metrics according to their current array order
    for (let i = 0; i < resultMetrics.length; i++) {
      resultMetrics[i].order = i;
    }

    adAccount.metrics = resultMetrics;
    currentAdAccounts[accountIndex] = adAccount;
    this.adAccounts.set(currentAdAccounts);
  }
}
