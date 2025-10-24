import { Component, ElementRef, Input, AfterViewInit, OnDestroy, QueryList, ViewChildren, input, model, ViewChild } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { ReportsDataService } from 'src/app/services/reports-data.service';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';
import Sortable from 'sortablejs';
import { NgZone, inject } from '@angular/core';
import { AdsAdAccountDataCreative, AdsAdAccountDataPoint } from 'src/app/interfaces/get-report.interfaces';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent implements AfterViewInit, OnDestroy {

  public metricsService = inject(MetricsService);

  private sortables: Sortable[] = [];
  private adAccountsSortable: Sortable | null = null;

  @ViewChildren('adsGridContainer') gridContainers!: QueryList<ElementRef>;
  @ViewChild('adAccountsContainer', { static: false }) adAccountsContainer?: ElementRef<HTMLElement>;

  adAccounts = model<AdAccount[]>([]);
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);

  private readonly defaultCreativesLimit = 10;

  private ngZone = inject(NgZone);
  private notificationService = inject(NotificationService);

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
    const point = creative?.metrics?.find(metric => metric.name === metricName);
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
    const metrics = [...(adAccount.metrics ?? [])].sort((a, b) => a.order - b.order).filter(m => m.name !== 'ad_name');
    const dataByName = new Map<string, AdsAdAccountDataPoint>();
    for (const metric of creative.metrics ?? []) {
      dataByName.set(metric.name, metric);
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

  async copyToClipboard(text: string, event?: MouseEvent): Promise<void> {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const write = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (_) {
        // ignore and try fallback
      }

      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (_) {
        return false;
      }
    };

    const success = await write();
    if (success) {
      this.notificationService.info('Ad name copied to clipboard');
    }
  }

  getCreativesLimit(adAccount: AdAccount): number {
    return adAccount.adsSettings?.maxAds ?? this.defaultCreativesLimit;
  }

  onCreativesLimitChange(adAccountId: string, value: string | number): void {
    const parsed = typeof value === 'number' ? value : parseInt(value, 10);
    if (Number.isNaN(parsed)) return;

    const current = [...this.adAccounts()];

    current.forEach(a => {
      if (a.id === adAccountId) {
        a.adsSettings = {
          maxAds: parsed,
          sortBy: a.adsSettings?.sortBy ?? ''
        };
      }
    });

    this.adAccounts.set(current);
  }

  getAccountEnabledMetrics(adAccount: AdAccount): Metric[] {
    const metrics = adAccount.metrics ?? [];
    return [...metrics].filter(m => Boolean(m.enabled)).sort((a, b) => a.order - b.order);
  }

  getAdAccountSortOptions(adAccount: AdAccount): { value: string; label: string }[] {
    return this.getAccountEnabledMetrics(adAccount)
      .filter(m => m.name !== 'ad_name')
      .map(m => ({ value: m.name, label: this.metricsService.getFormattedMetricName(m.name) }))

  }

  getCreativesSortMetric(adAccount: AdAccount): string | null {
    return adAccount.adsSettings?.sortBy ?? null;
  }

  onCreativesSortMetricChange(adAccountId: string, metricName: string): void {
    if (!metricName) return;

    const current = [...this.adAccounts()];

    current.forEach(a => {
      if (a.id === adAccountId) {
        a.adsSettings = {
          maxAds: a.adsSettings?.maxAds ?? 10,
          sortBy: metricName
        };
      }
    });

    this.adAccounts.set(current);
  }

  getSortedCreatives(adAccount: AdAccount): AdsAdAccountDataCreative[] {
    const creatives = [...(adAccount.creativesData ?? [])];
    return creatives;
    // const metricName = this.getCreativesSortMetric(adAccount);
    // if (!metricName) return creatives;
    // return creatives.sort((a, b) => {
    //   const aVal = this.getCreativeMetricValue(a, metricName);
    //   const bVal = this.getCreativeMetricValue(b, metricName);
    //   const aScore = (aVal === undefined || aVal === null) ? Number.NEGATIVE_INFINITY : aVal;
    //   const bScore = (bVal === undefined || bVal === null) ? Number.NEGATIVE_INFINITY : bVal;
    //   return bScore - aScore; // Descending: best first
    // });
  }
}
