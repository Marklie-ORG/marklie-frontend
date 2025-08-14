import { Component, ElementRef, inject, input, Input, model, OnDestroy, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';
import Sortable from 'sortablejs';

@Component({
  selector: 'campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss'
})
export class CampaignTableComponent implements AfterViewInit, OnDestroy {
  
  private sortables: Sortable[] = [];

  @ViewChildren('campaignsHeaderContainer') headerContainers!: QueryList<ElementRef>;

  @Input() campaigns: any[] = [];
  adAccounts = model<AdAccount[]>([]);
  isViewMode = input<boolean>(false);

  enabledMetrics: Metric[] = [];

  public metricsService = inject(MetricsService);

  ngAfterViewInit(): void {
    this.initSortables();
    this.headerContainers.changes.subscribe(() => {
      this.initSortables();
    });
  }

  ngOnDestroy(): void {
    this.destroySortables();
  }

  private initSortables(): void {
    this.destroySortables();
    this.headerContainers.forEach(headerRef => {
      const headerEl = headerRef.nativeElement as HTMLElement;
      const adAccountId = headerEl.dataset['adAccountId'] ?? 'default';
      const sortable = Sortable.create(headerEl, {
        group: { name: `campaign-metrics-${adAccountId}`, pull: false, put: false },
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        draggable: '.draggable-metric-header',
        filter: '.non-sortable',
        onEnd: (event) => this.reorderItems(event),
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

  private reorderItems(event: Sortable.SortableEvent) {
    const headerEl = event.from as HTMLElement;
    const adAccountId = headerEl.dataset['adAccountId'];
    if (!adAccountId) return;

    const accounts = this.adAccounts();
    const account = accounts.find(a => a.id === adAccountId);
    if (!account) return;

    const enabledOrderFromDom: string[] = Array.from(headerEl.querySelectorAll('.draggable-metric-header'))
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
