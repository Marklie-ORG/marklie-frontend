import { Component, ElementRef, Input, AfterViewInit, OnDestroy, QueryList, ViewChildren, input, model, ViewChild } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';
import Sortable from 'sortablejs';
import { NgZone, inject } from '@angular/core';
import { AdsAdAccountDataCreative, AdsAdAccountDataPoint } from 'src/app/interfaces/get-report.interfaces';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent implements AfterViewInit, OnDestroy {

  private sortables: Sortable[] = [];
  private adAccountsSortable: Sortable | null = null;

  @ViewChildren('adsGridContainer') gridContainers!: QueryList<ElementRef>;
  @ViewChild('adAccountsContainer', { static: false }) adAccountsContainer?: ElementRef<HTMLElement>;
  
  adAccounts = model<AdAccount[]>([]);
  isViewMode = input<boolean>(false);

  constructor(public metricsService: MetricsService) {}

  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    this.initAdAccountsSortable();
    this.initSortables();
    this.gridContainers.changes.subscribe(() => {
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
      group: { name: 'ad-cards-ad-accounts', pull: false, put: false },
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

  getCreativeMetricValue(creative: AdsAdAccountDataCreative, metricName: string): number | undefined {
    const point = creative?.data?.find(p => p.name === metricName);
    return point?.value;
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

  isMetricEnabled(adAccount: AdAccount, metricName: string): boolean {
    if (!adAccount || !adAccount.metrics) return false;
    for (const metric of adAccount.metrics) {
      if (metric.name === metricName) {
        return Boolean(metric.enabled);
      }
    }
    return false;
  }

  getOrderedCreativePoints(adAccount: AdAccount, creative: AdsAdAccountDataCreative): AdsAdAccountDataPoint[] {
    const metrics = [...(adAccount.metrics ?? [])].sort((a, b) => a.order - b.order);
    const dataByName = new Map<string, AdsAdAccountDataPoint>();
    for (const p of creative.data ?? []) {
      dataByName.set(p.name, p);
    }

    const enabledMetrics = metrics.filter(m => Boolean(m.enabled));
    const result: AdsAdAccountDataPoint[] = [];
    for (const m of enabledMetrics) {
      const existing = dataByName.get(m.name);
      if (existing) {
        result.push(existing);
      } else {
        result.push({ name: m.name, order: m.order, value: 0 });
      }
    }
    return result;
  }

}
