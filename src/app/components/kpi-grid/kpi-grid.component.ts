import { Component, effect, ElementRef, input, Input, model, ViewChildren, QueryList, OnDestroy, AfterViewInit, computed, ViewChild, signal, HostListener } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { AdAccount } from 'src/app/interfaces/report-sections.interfaces';
import Sortable from 'sortablejs';
import type { Metric } from 'src/app/interfaces/report-sections.interfaces';
import { NgZone, inject } from '@angular/core';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'kpi-grid',
  templateUrl: './kpi-grid.component.html',
  styleUrl: './kpi-grid.component.scss'
})
export class KpiGridComponent implements AfterViewInit, OnDestroy {

  private sortablesByAdAccountId: Map<string, Sortable> = new Map();
  private adAccountsSortable: Sortable | null = null;

  @ViewChildren('kpiGridContainer') kpiGridContainers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('adAccountsContainer', { static: false }) adAccountsContainer?: ElementRef<HTMLElement>;
  @ViewChildren('menuItem') menuItems?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('menu') menus?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('duplicateMenu') duplicateMenus?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('triggerButton') triggerButtons?: QueryList<ElementRef<HTMLElement>>;
  
  adAccounts = model<AdAccount[]>([]);
  
  isViewMode = input<boolean>(false);

  isReorderingAdAccounts = signal<boolean>(false);
  openMenuForAdAccountId = signal<string | null>(null);
  duplicateOpenForAdAccountId = signal<string | null>(null);
  duplicateSelectedTargets = signal<Set<string>>(new Set());
  duplicateMenuCoords = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  faEllipsis = faEllipsis;

  constructor(
    public metricsService: MetricsService
  ) {
    // react to view mode changes and toggle sortable instances
    effect(() => {
      const disabled = this.isViewMode();
      queueMicrotask(() => {
        if (this.adAccountsSortable) this.adAccountsSortable.option('disabled', disabled);
        this.sortablesByAdAccountId.forEach((s) => s.option('disabled', disabled));
      });
    });
  }

  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    this.initializeAdAccountsSortable();
    this.initializeSortables();

    // Re-initialize when the containers list changes (e.g., ad accounts updated)
    this.kpiGridContainers.changes.subscribe(() => {
      this.destroyAllSortables();
      this.initializeSortables();
    });
  }

  ngOnDestroy(): void {
    this.destroyAllSortables();
    if (this.adAccountsSortable) {
      this.adAccountsSortable.destroy();
      this.adAccountsSortable = null;
    }
  }

  // Dropdown menu logic (modeled after dashboard header)
  toggleDropdown(adAccountId: string) {
    const current = this.openMenuForAdAccountId();
    if (current === adAccountId) {
      this.closeDropdown(true, adAccountId);
    } else {
      this.openMenuForAdAccountId.set(adAccountId);
      setTimeout(() => this.focusFirstItem(adAccountId), 0);
    }
  }

  closeDropdown(focusTrigger: boolean = false, adAccountId?: string) {
    const current = this.openMenuForAdAccountId();
    if (!current) return;

    const idToClose = adAccountId ?? current;
    this.openMenuForAdAccountId.set(null);
    if (focusTrigger) {
      setTimeout(() => this.focusTriggerButton(idToClose), 0);
    }
  }

  onTriggerKeydown(event: KeyboardEvent, adAccountId: string) {
    const key = event.key;
    if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (this.openMenuForAdAccountId() !== adAccountId) {
        this.openMenuForAdAccountId.set(adAccountId);
        setTimeout(() => this.focusFirstItem(adAccountId), 0);
      } else {
        this.focusFirstItem(adAccountId);
      }
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      if (this.openMenuForAdAccountId() !== adAccountId) {
        this.openMenuForAdAccountId.set(adAccountId);
        setTimeout(() => this.focusLastItem(adAccountId), 0);
      } else {
        this.focusLastItem(adAccountId);
      }
    } else if (key === 'Escape') {
      this.closeDropdown(true, adAccountId);
    }
  }

  onMenuKeydown(event: KeyboardEvent, adAccountId: string) {
    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.focusNextItem(adAccountId);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      this.focusPreviousItem(adAccountId);
    } else if (key === 'Home') {
      event.preventDefault();
      this.focusFirstItem(adAccountId);
    } else if (key === 'End') {
      event.preventDefault();
      this.focusLastItem(adAccountId);
    } else if (key === 'Escape') {
      event.preventDefault();
      this.closeDropdown(true, adAccountId);
    } else if (key === 'Tab') {
      this.closeDropdown();
    }
  }

  onMenuItemClick(adAccountId: string) {
    this.closeDropdown(true, adAccountId);
  }

  private getMenuItemElements(adAccountId: string): HTMLElement[] {
    const items = this.menuItems?.toArray().map(r => r.nativeElement) || [];
    return items.filter(el => el.dataset['adaccountId'] === String(adAccountId) && !el.hasAttribute('disabled'));
  }

  private focusTriggerButton(adAccountId: string) {
    const triggers = this.triggerButtons?.toArray().map(r => r.nativeElement) || [];
    const btn = triggers.find(el => el.dataset['adaccountId'] === String(adAccountId));
    if (btn) btn.focus();
  }

  private getMenuElement(adAccountId: string): HTMLElement | undefined {
    const menus = this.menus?.toArray().map(r => r.nativeElement) || [];
    return menus.find(el => el.dataset['adaccountId'] === String(adAccountId));
  }

  private focusFirstItem(adAccountId: string) {
    const items = this.getMenuItemElements(adAccountId);
    if (items.length > 0) items[0].focus();
  }

  private focusLastItem(adAccountId: string) {
    const items = this.getMenuItemElements(adAccountId);
    if (items.length > 0) items[items.length - 1].focus();
  }

  private focusNextItem(adAccountId: string) {
    const items = this.getMenuItemElements(adAccountId);
    const index = items.findIndex(el => el === document.activeElement);
    const nextIndex = index >= 0 ? (index + 1) % items.length : 0;
    if (items[nextIndex]) items[nextIndex].focus();
  }

  private focusPreviousItem(adAccountId: string) {
    const items = this.getMenuItemElements(adAccountId);
    const index = items.findIndex(el => el === document.activeElement);
    const prevIndex = index > 0 ? index - 1 : items.length - 1;
    if (items[prevIndex]) items[prevIndex].focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    const openId = this.openMenuForAdAccountId();
    const dupOpenId = this.duplicateOpenForAdAccountId();

    const triggers = this.triggerButtons?.toArray().map(r => r.nativeElement) || [];
    const triggerEl = openId ? triggers.find(el => el.dataset['adaccountId'] === String(openId)) : undefined;
    const menuEl = openId ? this.getMenuElement(openId) : undefined;
    const dupMenuEl = dupOpenId ? this.getDuplicateMenuElement(dupOpenId) : undefined;

    const clickInsideTrigger = !!triggerEl && triggerEl.contains(target as Node);
    const clickInsideMenu = !!menuEl && menuEl.contains(target);
    const clickInsideDuplicate = !!dupMenuEl && dupMenuEl.contains(target);

    if (!clickInsideTrigger && !clickInsideMenu && !clickInsideDuplicate) {
      if (openId) this.closeDropdown();
      if (dupOpenId) this.cancelDuplicateMetrics();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    const openId = this.openMenuForAdAccountId();
    if (openId) this.closeDropdown(true, openId);
    const dupOpenId = this.duplicateOpenForAdAccountId();
    if (dupOpenId) this.cancelDuplicateMetrics();
  }

  // Actions for menu items
  onDuplicateMetrics(adAccountId: string) {
    // Open secondary popover for multi-select targets; keep main menu open
    this.duplicateOpenForAdAccountId.set(adAccountId);
    this.duplicateSelectedTargets.set(new Set());

    // Position the duplicate menu next to the trigger (fixed coordinates)
    const triggers = this.triggerButtons?.toArray().map(r => r.nativeElement) || [];
    const triggerEl = triggers.find(el => el.dataset['adaccountId'] === String(adAccountId));
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      const gap = 12; // px
      const menuWidth = 280; // matches CSS width
      const left = Math.min(rect.right + gap, (window.innerWidth - menuWidth - 8));
      const top = rect.top + rect.height + 8;
      this.duplicateMenuCoords.set({ top, left: Math.max(8, left) });
    }
  }

  onSetMetricsForAllAccounts(adAccountId: string) {
    const currentAdAccounts = [...this.adAccounts()];
    const sourceIndex = currentAdAccounts.findIndex(a => String(a.id) === String(adAccountId));
    if (sourceIndex < 0) return;

    const source = currentAdAccounts[sourceIndex];

    // Enabled default (non-custom) metrics from the source, in their current order
    const sourceDefaultNames = source.metrics
      .filter(m => (m.enabled === true) && (m.isCustom !== true))
      .sort((a, b) => a.order - b.order)
      .map(m => m.name);

    if (sourceDefaultNames.length === 0) {
      this.onMenuItemClick(adAccountId);
      return;
    }

    const updated: AdAccount[] = currentAdAccounts.map(acc => {
      if (String(acc.id) === String(adAccountId)) return { ...acc };

      const existingMetrics: Metric[] = Array.isArray(acc.metrics) ? acc.metrics.map(m => ({ ...m })) : [];

      // Lookup by name for quick access (prefer non-custom matches)
      const byName = new Map<string, Metric>();
      for (const m of existingMetrics) {
        if (!byName.has(m.name)) byName.set(m.name, m);
        // Prefer non-custom over custom if duplicate names somehow exist
        else if (byName.get(m.name)!.isCustom && !m.isCustom) byName.set(m.name, m);
      }

      // Bring source defaults to the top in the same order and enable them
      const prioritized: Metric[] = sourceDefaultNames.map((name, idx) => {
        const existing = byName.get(name);
        if (existing) {
          return { ...existing, enabled: true, isCustom: false, order: idx } as Metric;
        }
        // If missing, create a minimal non-custom metric entry
        return { name, enabled: true, isCustom: false, order: idx } as Metric;
      });

      // All other metrics (that are not in source defaults) follow, disabled, original relative order preserved
      const others: Metric[] = existingMetrics
        .filter(m => !sourceDefaultNames.includes(m.name))
        .map(m => (m.isCustom ? { ...m } : { ...m, enabled: false }));

      const combined: Metric[] = [...prioritized, ...others]
        .map((m, i) => ({ ...m, order: i }));

      return { ...acc, metrics: combined } as AdAccount;
    });

    this.adAccounts.set(updated);
    this.onMenuItemClick(adAccountId);
  }

  // Duplicate metrics popover helpers and actions
  isTargetSelected(targetId: string): boolean {
    return this.duplicateSelectedTargets().has(String(targetId));
  }

  toggleTargetSelection(targetId: string) {
    const set = new Set(this.duplicateSelectedTargets());
    const id = String(targetId);
    if (set.has(id)) set.delete(id); else set.add(id);
    this.duplicateSelectedTargets.set(set);
  }

  cancelDuplicateMetrics() {
    this.duplicateOpenForAdAccountId.set(null);
    this.duplicateSelectedTargets.set(new Set());
  }

  private getDuplicateMenuElement(adAccountId: string): HTMLElement | undefined {
    const menus = this.duplicateMenus?.toArray().map(r => r.nativeElement) || [];
    return menus.find(el => el.dataset['adaccountId'] === String(adAccountId));
  }

  applyDuplicateMetrics(fromAdAccountId: string) {
    const selected = Array.from(this.duplicateSelectedTargets());
    if (selected.length === 0) {
      this.cancelDuplicateMetrics();
      return;
    }

    const currentAdAccounts = [...this.adAccounts()];
    const source = currentAdAccounts.find(a => String(a.id) === String(fromAdAccountId));
    if (!source) {
      this.cancelDuplicateMetrics();
      return;
    }

    // Enabled default (non-custom) metrics from the source, ordered
    const sourceDefaultNames = source.metrics
      .filter(m => (m.enabled === true) && (m.isCustom !== true))
      .sort((a, b) => a.order - b.order)
      .map(m => m.name);

    if (sourceDefaultNames.length === 0) {
      this.cancelDuplicateMetrics();
      return;
    }

    const updated = currentAdAccounts.map(acc => {
      const id = String(acc.id);
      if (id === String(fromAdAccountId)) return { ...acc };
      if (!selected.includes(id)) return { ...acc };

      const existingMetrics: Metric[] = Array.isArray(acc.metrics) ? acc.metrics.map(m => ({ ...m })) : [];

      // Prefer non-custom if duplicates by name
      const byName = new Map<string, Metric>();
      for (const m of existingMetrics) {
        if (!byName.has(m.name)) byName.set(m.name, m);
        else if (byName.get(m.name)!.isCustom && !m.isCustom) byName.set(m.name, m);
      }

      const prioritized: Metric[] = sourceDefaultNames.map((name, idx) => {
        const existing = byName.get(name);
        if (existing) {
          return { ...existing, enabled: true, isCustom: false, order: idx } as Metric;
        }
        return { name, enabled: true, isCustom: false, order: idx } as Metric;
      });

      const others: Metric[] = existingMetrics
        .filter(m => !sourceDefaultNames.includes(m.name))
        .map(m => (m.isCustom ? { ...m } : { ...m, enabled: false }));

      const combined: Metric[] = [...prioritized, ...others]
        .map((m, i) => ({ ...m, order: i }));

      return { ...acc, metrics: combined } as AdAccount;
    });

    this.adAccounts.set(updated);
    this.cancelDuplicateMetrics();
  }

  private initializeAdAccountsSortable(): void {
    const disableDragging = this.isViewMode();
    const containerEl = this.adAccountsContainer?.nativeElement;
    if (!containerEl) return;

    if (this.adAccountsSortable) {
      this.adAccountsSortable.destroy();
      this.adAccountsSortable = null;
    }

    this.adAccountsSortable = this.ngZone.runOutsideAngular(() => Sortable.create(containerEl, {
      animation: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      group: { name: 'kpi-ad-accounts', pull: false, put: false },
      draggable: '.ad-account-item',
      handle: 'h4',
      disabled: disableDragging,
      onStart: () => this.ngZone.run(() => this.isReorderingAdAccounts.set(true)),
      onEnd: (event) => this.ngZone.run(() => { this.isReorderingAdAccounts.set(false); this.onAdAccountsReorderEnd(event); }),
    }));
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

  private onAdAccountsReorderEnd(event: Sortable.SortableEvent): void {
    const containerEl = this.adAccountsContainer?.nativeElement;
    if (!containerEl) return;

    const current = [...this.adAccounts()];

    // Build new enabled order from DOM
    const enabledOrderIds = Array.from(containerEl.querySelectorAll('.ad-account-item'))
      .map(el => (el as HTMLElement).dataset['adaccountId']!)
      .filter(Boolean);

    // Map enabled ad accounts by id and collect their original positions
    const enabledById = new Map<string, AdAccount>();
    const enabledPositions: number[] = [];
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      if (a.enabled) {
        enabledById.set(String(a.id), a);
        enabledPositions.push(i);
      }
    }

    // Reorder enabled according to DOM
    const reorderedEnabled: AdAccount[] = [];
    for (const id of enabledOrderIds) {
      const acc = enabledById.get(String(id));
      if (acc) reorderedEnabled.push({ ...acc });
    }

    // Rebuild full list, keeping disabled at their original positions
    const result: AdAccount[] = current.map(a => ({ ...a }));
    for (let i = 0; i < enabledPositions.length; i++) {
      const pos = enabledPositions[i];
      result[pos] = { ...reorderedEnabled[i] };
    }

    // Update order field sequentially across all accounts
    result.forEach((a, idx) => a.order = idx);

    this.adAccounts.set(result);
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
