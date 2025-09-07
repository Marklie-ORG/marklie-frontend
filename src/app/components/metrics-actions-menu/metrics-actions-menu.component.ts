import { Component, ElementRef, HostListener, ViewChild, input, output, signal } from '@angular/core';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'metrics-actions-menu',
  templateUrl: './metrics-actions-menu.component.html',
  styleUrl: './metrics-actions-menu.component.scss'
})
export class MetricsActionsMenuComponent {
  adAccounts = input.required<AdAccount[]>();
  sourceAdAccountId = input.required<string>();
  disabled = input<boolean>(false);

  adAccountsChange = output<AdAccount[]>();

  faEllipsis = faEllipsis;

  isOpen = signal<boolean>(false);
  duplicateOpen = signal<boolean>(false);
  duplicateSelectedTargets = signal<Set<string>>(new Set());
  duplicateMenuCoords = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  @ViewChild('triggerButton') triggerButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('menu') menu?: ElementRef<HTMLElement>;
  @ViewChild('duplicateMenu') duplicateMenu?: ElementRef<HTMLElement>;

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  closeDropdown(focusTrigger: boolean = false) {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    if (focusTrigger) {
      setTimeout(() => this.triggerButton?.nativeElement.focus(), 0);
    }
  }

  onTriggerKeydown(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
    } else if (key === 'Escape') {
      this.closeDropdown(true);
    }
  }

  onDuplicateClick() {
    this.duplicateOpen.set(true);
    this.duplicateSelectedTargets.set(new Set());
    // position duplicate menu near trigger
    const triggerEl = this.triggerButton?.nativeElement;
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      const gap = 12;
      const menuWidth = 280;
      const left = Math.min(rect.right + gap, (window.innerWidth - menuWidth - 8));
      const top = rect.top + rect.height + 8;
      this.duplicateMenuCoords.set({ top, left: Math.max(8, left) });
    }
  }

  cancelDuplicate() {
    this.duplicateOpen.set(false);
    this.duplicateSelectedTargets.set(new Set());
  }

  isTargetSelected(targetId: string): boolean {
    return this.duplicateSelectedTargets().has(String(targetId));
  }

  toggleTargetSelection(targetId: string) {
    const set = new Set(this.duplicateSelectedTargets());
    const id = String(targetId);
    if (set.has(id)) set.delete(id); else set.add(id);
    this.duplicateSelectedTargets.set(set);
  }

  applyDuplicate() {
    const selected = Array.from(this.duplicateSelectedTargets());
    if (selected.length === 0) {
      this.cancelDuplicate();
      return;
    }
    const currentAdAccounts = [...this.adAccounts()];
    const source = currentAdAccounts.find(a => String(a.id) === String(this.sourceAdAccountId()));
    if (!source) {
      this.cancelDuplicate();
      return;
    }

    const sourceDefaultNames = source.metrics
      .filter(m => (m.enabled === true) && (m.isCustom !== true))
      .sort((a, b) => a.order - b.order)
      .map(m => m.name);

    if (sourceDefaultNames.length === 0) {
      this.cancelDuplicate();
      return;
    }

    const updated = currentAdAccounts.map(acc => {
      const id = String(acc.id);
      if (id === String(this.sourceAdAccountId())) return { ...acc };
      if (!selected.includes(id)) return { ...acc };

      const existingMetrics: Metric[] = Array.isArray(acc.metrics) ? acc.metrics.map(m => ({ ...m })) : [];

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

    this.adAccountsChange.emit(updated);
    this.cancelDuplicate();
  }

  setMetricsForAll() {
    const currentAdAccounts = [...this.adAccounts()];
    const source = currentAdAccounts.find(a => String(a.id) === String(this.sourceAdAccountId()));
    if (!source) return;

    const sourceDefaultNames = source.metrics
      .filter(m => (m.enabled === true) && (m.isCustom !== true))
      .sort((a, b) => a.order - b.order)
      .map(m => m.name);

    if (sourceDefaultNames.length === 0) {
      this.closeDropdown(true);
      return;
    }

    const updated: AdAccount[] = currentAdAccounts.map(acc => {
      if (String(acc.id) === String(this.sourceAdAccountId())) return { ...acc };

      const existingMetrics: Metric[] = Array.isArray(acc.metrics) ? acc.metrics.map(m => ({ ...m })) : [];

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

    this.adAccountsChange.emit(updated);
    this.closeDropdown(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    const trigger = this.triggerButton?.nativeElement;
    const menu = this.menu?.nativeElement;
    const dup = this.duplicateMenu?.nativeElement;

    const insideTrigger = !!trigger && trigger.contains(target);
    const insideMenu = !!menu && menu.contains(target);
    const insideDup = !!dup && dup.contains(target);

    if (!insideTrigger && !insideMenu && !insideDup) {
      this.closeDropdown();
      this.cancelDuplicate();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeDropdown(true);
    this.cancelDuplicate();
  }
}


