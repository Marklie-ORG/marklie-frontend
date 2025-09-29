import { Component, ElementRef, inject, input, Input, model, OnDestroy, AfterViewInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';
import Sortable from 'sortablejs';
import { NgZone } from '@angular/core';
import { CampaignData } from 'src/app/interfaces/get-report.interfaces';

@Component({
  selector: 'campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss'
})
export class CampaignTableComponent implements AfterViewInit, OnDestroy {
  
  private sortables: Sortable[] = [];
  private adAccountsSortable: Sortable | null = null;

  @ViewChildren('campaignsHeaderContainer') headerContainers!: QueryList<ElementRef>;
  @ViewChild('adAccountsContainer', { static: false }) adAccountsContainer?: ElementRef<HTMLElement>;
  
  adAccounts = model<AdAccount[]>([]);
  isViewMode = input<boolean>(false);

  enabledMetrics: Metric[] = [];

  public metricsService = inject(MetricsService);
  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    this.initAdAccountsSortable();
    this.initSortables();
    this.headerContainers.changes.subscribe(() => {
      this.initSortables();
    });
  }

  ngOnDestroy(): void {
    this.destroySortables();
    if (this.adAccountsSortable) {
      this.adAccountsSortable.destroy();
      this.adAccountsSortable = null;
    }
  }

  private initAdAccountsSortable(): void {
    const containerEl = this.adAccountsContainer?.nativeElement;
    if (!containerEl) return;

    if (this.adAccountsSortable) {
      this.adAccountsSortable.destroy();
      this.adAccountsSortable = null;
    }

    this.adAccountsSortable = this.ngZone.runOutsideAngular(() => Sortable.create(containerEl, {
      group: { name: 'campaign-table-ad-accounts', pull: false, put: false },
      animation: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      draggable: '.ad-account-item',
      handle: 'h4',
      onStart: () => this.ngZone.run(() => {
        containerEl.setAttribute('data-reordering', 'true');
        this.sortables.forEach(s => s.option('disabled', true));
      }),
      onEnd: () => this.ngZone.run(() => {
        containerEl.removeAttribute('data-reordering');
        this.sortables.forEach(s => s.option('disabled', this.isViewMode()));
        this.onAdAccountsReorderEnd();
      })
    }));

    if (this.isViewMode()) {
      this.adAccountsSortable.option('disabled', true);
    }
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

  private onAdAccountsReorderEnd(): void {
    const containerEl = this.adAccountsContainer?.nativeElement;
    if (!containerEl) return;

    const current = [...this.adAccounts()];

    const enabledOrderIds = Array.from(containerEl.querySelectorAll('.ad-account-item'))
      .map(el => (el as HTMLElement).dataset['adaccountId']!)
      .filter(Boolean);

    const enabledById = new Map<string, AdAccount>();
    const enabledPositions: number[] = [];
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      if (a.enabled) {
        enabledById.set(String(a.id), a);
        enabledPositions.push(i);
      }
    }

    const reorderedEnabled: AdAccount[] = [];
    for (const id of enabledOrderIds) {
      const acc = enabledById.get(String(id));
      if (acc) reorderedEnabled.push({ ...acc });
    }

    const result: AdAccount[] = current.map(a => ({ ...a }));
    for (let i = 0; i < enabledPositions.length; i++) {
      const pos = enabledPositions[i];
      result[pos] = { ...reorderedEnabled[i] };
    }

    result.forEach((a, idx) => a.order = idx);

    this.adAccounts.set(result);
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

  getCampaignMetricValue(campaign: CampaignData, metricName: string): string {
    const point = campaign?.data?.find(d => d.name === metricName);
    if (!point) return '';
    if ((point as any).currency) {
      const num = typeof point.value === 'number' ? point.value : parseFloat(String(point.value));
      const formatted = isNaN(num) ? String(point.value ?? '') : num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      const symbolOrCurrency = (point as any).symbol || (point as any).currency;
      return `${symbolOrCurrency} ${formatted}`;
    }
    const formatted = this.metricsService.formatMetricValue(metricName, point?.value);
    return `${formatted}${point?.symbol ?? ''}`;
  }
}
