import { Component, effect, ElementRef, EventEmitter, inject, Input, model, Output, ViewChild } from '@angular/core';
import { CustomFormulasService } from '@services/api/custom-formulas.service';
import Sortable from 'sortablejs';
import { AdAccount, Metric, ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { MetricsService } from 'src/app/services/metrics.service';
import { CustomMetricBuilderComponent, CustomMetricBuilderResult } from '../custom-metric-builder/custom-metric-builder.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { NgZone } from '@angular/core';

@Component({
  selector: 'edit-metrics',
  templateUrl: './edit-metrics.component.html',
  styleUrl: './edit-metrics.component.scss'
})
export class EditMetricsComponent {

  private customFormulasService: CustomFormulasService = inject(CustomFormulasService);
  private dialog = inject(MatDialog);
  public metricsService = inject(MetricsService);
  private ngZone = inject(NgZone);

  private sectionsSortable: Sortable | null = null;

  @ViewChild('sectionsContainer', { static: false }) set sectionsContainer(el: ElementRef | undefined) {
    if (this.sectionsSortable) {
      this.sectionsSortable.destroy();
      this.sectionsSortable = null;
    }

    if (el) {
      this.sectionsSortable = this.ngZone.runOutsideAngular(() => Sortable.create(el.nativeElement, {
        animation: 150,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        handle: '.handle',
        delay: 0,
        delayOnTouchOnly: true,
        onEnd: (event) => this.ngZone.run(() => this.reorderSections(event)),
      }));
    }
  }

  reportSections = model<ReportSection[]>([]);
  
  @Input() reportTitle: string | undefined = undefined;
  @Output() reportTitleChange = new EventEmitter<string>();
  @Output() sectionFocus = new EventEmitter<string>();

  headerBackgroundColor = model<string>('#ffffff');
  reportBackgroundColor = model<string>('#ffffff');

  toggles: { [key: string]: boolean } = {
    main: true,
    header: false,
    kpis: false,
    graphs: false,
    ads: false,
    campaigns: false
  }

  mainKPIs: ReportSection | undefined = undefined;
  graphs: ReportSection | undefined = undefined;
  bestCreatives: ReportSection | undefined = undefined;
  bestCampaigns: ReportSection | undefined = undefined;

  selectedAdAccountId: string = '';

  constructor() {

    effect(() => {
      this.mainKPIs = this.reportSections().find(section => section.key === 'kpis');
      this.graphs = this.reportSections().find(section => section.key === 'graphs');
      this.bestCreatives = this.reportSections().find(section => section.key === 'ads');
      this.bestCampaigns = this.reportSections().find(section => section.key === 'campaigns');
    })
    
  }

  togglePage(page: string): void {
    if (page === 'main' && this.selectedAdAccountId) {
      const activeSection = this.getActiveSection();
      const adAccountsCount = activeSection?.adAccounts?.length ?? 0;
      // Clear selected account either way
      this.selectedAdAccountId = '';
      // If more than one ad account, stay on the section and show the accounts list
      if (adAccountsCount > 1) {
        return;
      }
      // If only one ad account, proceed to main (sections list)
    }

    this.toggles[page] = !this.toggles[page];

    Object.keys(this.toggles).forEach(key => {
      if (key !== page) {
        this.toggles[key] = false;
      }
    });

    // Auto-open single ad account when entering a section; clear otherwise
    if (page !== 'main' && page !== 'header') {
      const targetSection = this.getSectionByKey(page);
      const accounts = targetSection?.adAccounts ?? [];
      this.selectedAdAccountId = accounts.length === 1 ? accounts[0].id : '';
      // Emit section focus only when opening the section
      if (this.toggles[page]) {
        this.sectionFocus.emit(page);
      }
    } else if (page === 'main') {
      this.selectedAdAccountId = '';
    }
  }

  toggleSelectedAdAccount(adAccountId: string): void {
    this.selectedAdAccountId = adAccountId;
  }

  onMetricsChange(data: ReportSection, sectionKey: string): void {
    const currentSections = this.reportSections();

    const updatedSections: ReportSection[] = currentSections.map((section) => {
      if (section.key !== sectionKey) return section;

      // Use the mutated `data` from the template as the source of truth,
      // but create new references for adAccounts and metrics
      const updatedAdAccounts = (data.adAccounts || []).map((account) => ({
        ...account,
        metrics: (account.metrics || []).map((metric) => ({ ...metric }))
      }));

      return { ...data, adAccounts: updatedAdAccounts } as ReportSection;
    });

    this.reportSections.set(updatedSections);
  }

  reorderSections(event: Sortable.SortableEvent) {
    // Get the current value of reportSections
    const sections = [...this.reportSections()]; // create a shallow copy

    // Remove the moved section from its old position
    const [movedSection] = sections.splice(event.oldIndex!, 1);

    // Insert the moved section at the new position
    sections.splice(event.newIndex!, 0, movedSection);

    // Update the order property for each section
    sections.forEach((s, index) => s.order = index);

    // Sort by order just in case
    sections.sort((a, b) => a.order - b.order);

    // Update the signal with the new array
    this.reportSections.set(sections);
  }

  getFormattedMetricName(metricName: string): string {
    return this.metricsService.getFormattedMetricName(metricName);
  }

  private getActiveSection(): ReportSection | undefined {
    if (this.toggles.kpis) return this.mainKPIs;
    if (this.toggles.graphs) return this.graphs;
    if (this.toggles.ads) return this.bestCreatives;
    if (this.toggles.campaigns) return this.bestCampaigns;
    return undefined;
  }

  private getSectionByKey(key: string): ReportSection | undefined {
    if (key === 'kpis') return this.mainKPIs;
    if (key === 'graphs') return this.graphs;
    if (key === 'ads') return this.bestCreatives;
    if (key === 'campaigns') return this.bestCampaigns;
    return undefined;
  }

  showCreateCustomFormulaModal(adAccount: AdAccount, sectionKey: string): void {
    const metrics = adAccount.metrics.filter(metric => !metric.isCustomFormula);
    const dialogRef = this.dialog.open(CustomMetricBuilderComponent, {
      width: '800px',
      data: {
        metrics,
        adAccountName: adAccount.name,
        mode: 'create',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      const payload = result as CustomMetricBuilderResult;
      if (!payload?.formula || !payload?.name) {
        return;
      }
      void this.handleCustomMetricSave(payload, adAccount, sectionKey);
    });
  }

  editCustomFormula(metric: Metric, adAccount: AdAccount, sectionKey: string, event?: Event): void {
    event?.stopPropagation();

    if (!metric.customFormulaUuid) {
      return;
    }

    const availableMetrics = adAccount.metrics.filter(item => !item.isCustomFormula || item.customFormulaUuid === metric.customFormulaUuid);

    void this.customFormulasService.getCustomFormula(metric.customFormulaUuid)
      .then(formula => {
        const dialogRef = this.dialog.open(CustomMetricBuilderComponent, {
          width: '800px',
          data: {
            metrics: availableMetrics,
            adAccountName: adAccount.name,
            mode: 'edit',
            initial: {
              name: formula?.name ?? metric.name,
              description: formula?.description ?? '',
              format: (formula?.format as any) ?? 'number',
              formula: formula?.formula ?? '',
            }
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) {
            return;
          }
          const payload = result as CustomMetricBuilderResult;
          if (payload.delete) {
            this.confirmDeleteCustomFormula(metric, adAccount, sectionKey, payload.name || metric.name);
            return;
          }
          if (!payload?.formula || !payload?.name) {
            return;
          }
          void this.handleCustomMetricUpdate(payload, metric, adAccount, sectionKey);
        });
      })
      .catch(error => {
        console.error('Failed to load custom formula', error);
      });
  }

  private async handleCustomMetricSave(result: CustomMetricBuilderResult, adAccount: AdAccount, sectionKey: string): Promise<void> {
    try {
      const description = result.description?.trim() ?? '';
      const created = await this.customFormulasService.createCustomFormula({
        name: result.name,
        formula: result.formula,
        format: result.format ?? 'number',
        description,
        adAccountId: adAccount.id,
      });

      const nextOrder = adAccount.metrics.reduce((max, metric) => Math.max(max, metric.order ?? -1), -1) + 1;
      const newMetric: Metric = {
        name: created?.name ?? result.name,
        order: created?.order ?? nextOrder,
        enabled: true,
        isCustomFormula: true,
        customFormulaUuid: created?.uuid ?? created?.customFormulaUuid,
      };

      this.updateReportSectionsWithNewMetric(sectionKey, adAccount.id, newMetric);
    } catch (error) {
      console.error('Failed to create custom formula', error);
    }
  }

  private async handleCustomMetricUpdate(result: CustomMetricBuilderResult, metric: Metric, adAccount: AdAccount, sectionKey: string): Promise<void> {
    if (!metric.customFormulaUuid) {
      return;
    }

    try {
      const description = result.description?.trim() ?? '';
      const updated = await this.customFormulasService.updateCustomFormula(metric.customFormulaUuid, {
        name: result.name,
        formula: result.formula,
        format: result.format ?? 'number',
        description
      });

      const updates: Partial<Metric> = {
        name: updated?.name ?? result.name,
        order: updated?.order ?? metric.order,
        enabled: metric.enabled,
        isCustomFormula: true,
        customFormulaUuid: metric.customFormulaUuid,
      };

      this.updateMetricInReportSections(sectionKey, adAccount.id, metric.customFormulaUuid, updates);
    } catch (error) {
      console.error('Failed to update custom formula', error);
    }
  }

  confirmDeleteCustomFormula(metric: Metric, adAccount: AdAccount, sectionKey: string, displayName?: string): void {
    if (!metric.customFormulaUuid) {
      return;
    }

    const nameForDisplay = displayName ?? metric.name;

    const data: ConfirmDialogData = {
      title: 'Delete custom metric',
      message: `Are you sure you want to delete custom metric "${this.getFormattedMetricName(nameForDisplay)}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      await this.deleteCustomFormula(metric, adAccount, sectionKey);
    });
  }

  private async deleteCustomFormula(metric: Metric, adAccount: AdAccount, sectionKey: string): Promise<void> {
    if (!metric.customFormulaUuid) {
      return;
    }

    try {
      await this.customFormulasService.deleteCustomFormula(metric.customFormulaUuid);
      this.removeMetricFromReportSections(sectionKey, adAccount.id, metric.customFormulaUuid);
    } catch (error) {
      console.error('Failed to delete custom formula', error);
    }
  }

  private updateReportSectionsWithNewMetric(sectionKey: string, adAccountId: string, metric: Metric): void {
    const currentSections = this.reportSections();
    const updatedSections = currentSections.map(section => {
      if (section.key !== sectionKey) {
        return section;
      }

      const updatedAdAccounts = section.adAccounts.map(account => {
        if (account.id !== adAccountId) {
          return account;
        }

        const nextOrder = metric.order ?? account.metrics.reduce((max, current) => Math.max(max, current.order ?? -1), -1) + 1;
        const metricToInsert: Metric = {
          ...metric,
          order: nextOrder,
        };

        const baseMetrics = metricToInsert.customFormulaUuid
          ? account.metrics.filter(existing => existing.customFormulaUuid !== metricToInsert.customFormulaUuid)
          : account.metrics;

        const updatedMetrics = [...baseMetrics, metricToInsert].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        return {
          ...account,
          metrics: updatedMetrics,
        };
      });

      return {
        ...section,
        adAccounts: updatedAdAccounts,
      };
    });

    this.reportSections.set(updatedSections);
  }

  private updateMetricInReportSections(sectionKey: string, adAccountId: string, customFormulaUuid: string, updates: Partial<Metric>): void {
    const currentSections = this.reportSections();
    const updatedSections = currentSections.map(section => {
      if (section.key !== sectionKey) {
        return section;
      }

      const updatedAdAccounts = section.adAccounts.map(account => {
        if (account.id !== adAccountId) {
          return account;
        }

        const updatedMetrics = account.metrics.map(metric => {
          if (metric.customFormulaUuid !== customFormulaUuid) {
            return metric;
          }

          return { ...metric, ...updates };
        });

        return {
          ...account,
          metrics: updatedMetrics,
        };
      });

      return {
        ...section,
        adAccounts: updatedAdAccounts,
      };
    });

    this.reportSections.set(updatedSections);
  }

  private removeMetricFromReportSections(sectionKey: string, adAccountId: string, customFormulaUuid: string): void {
    const currentSections = this.reportSections();
    const updatedSections = currentSections.map(section => {
      if (section.key !== sectionKey) {
        return section;
      }

      const updatedAdAccounts = section.adAccounts.map(account => {
        if (account.id !== adAccountId) {
          return account;
        }

        const filteredMetrics = account.metrics.filter(metric => metric.customFormulaUuid !== customFormulaUuid);

        return {
          ...account,
          metrics: filteredMetrics,
        };
      });

      return {
        ...section,
        adAccounts: updatedAdAccounts,
      };
    });

    this.reportSections.set(updatedSections);
  }

}
