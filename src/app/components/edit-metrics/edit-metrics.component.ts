import { Component, effect, ElementRef, EventEmitter, inject, Input, model, Output, ViewChild } from '@angular/core';
import { CustomFormulasService } from '@services/api/custom-formulas.service';
import Sortable from 'sortablejs';
import { AdAccount, ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'edit-metrics',
  templateUrl: './edit-metrics.component.html',
  styleUrl: './edit-metrics.component.scss'
})
export class EditMetricsComponent {

  private customFormulasService: CustomFormulasService = inject(CustomFormulasService);

  private sectionsSortable: Sortable | null = null;

  private customMetricBuilderContext: { sectionKey: string; adAccount: AdAccount } | null = null;

  @ViewChild('sectionsContainer', { static: false }) set sectionsContainer(el: ElementRef | undefined) {
    if (this.sectionsSortable) {
      this.sectionsSortable.destroy();
      this.sectionsSortable = null;
    }

    if (el) {
      this.sectionsSortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderSections(event),
      });
    }
  }

  reportSections = model<ReportSection[]>([]);
  // @Input() reportSections: ReportSection[] = [];
  // @Output() reportSectionsChange = new EventEmitter<ReportSection[]>();
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

  constructor(
    public metricsService: MetricsService,
  ) {
    effect(() => {
      // console.log(this.reportSections())
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

  // toggleAdAccount(adAccount: AdAccount): void {
  //   adAccount.enabled = !adAccount.enabled;
  // }

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

  // ngOnChanges(): void {
  //   if (this.reportSections) {
  //     this.mainKPIs = this.reportSections().find(section => section.key === 'kpis');
  //     this.graphs = this.reportSections().find(section => section.key === 'graphs');
  //     this.bestCreatives = this.reportSections().find(section => section.key === 'ads');
  //     this.bestCampaigns = this.reportSections().find(section => section.key === 'campaigns');
  //   }
  // }

  // onMetricsChange(): void {
  //   if (!this.reportSections.length) return;


  //   // this.reportSections.forEach(section => {
  //   //   if (!section.metrics.map((metric: any) => metric.enabled).includes(true)) section.enabled = false; // if all metrics are disabled, disable the section
  //   //   else if (!section.enabled && section.metrics.map((metric: any) => metric.enabled).includes(true)) section.enabled = true; // if any metric is enabled, enable the section
  //   // });

  //   const reportSections: ReportSection[] = [ // explicitly copy the object so that it triggers changes in paremt component
  //     ...this.reportSections
  //   ];
  //   this.reportSectionsChange.emit(reportSections);
  // }

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

  isCustomMetricBuilderOpen(): boolean {
    return !!this.customMetricBuilderContext;
  }

  get customMetricBuilderMetrics(): AdAccount['metrics'] {
    return this.customMetricBuilderContext?.adAccount.metrics.filter(metric => !metric.isCustomFormula) ?? [];
  }

  get customMetricBuilderAccountName(): string {
    return this.customMetricBuilderContext?.adAccount.name ?? '';
  }

  openCustomMetricBuilder(adAccount: AdAccount, sectionKey: string): void {
    this.customMetricBuilderContext = { adAccount, sectionKey };
  }

  closeCustomMetricBuilder(): void {
    this.customMetricBuilderContext = null;
  }

  handleCustomMetricSave(formula: string): void {
    const context = this.customMetricBuilderContext;

    if (context) {

      this.customFormulasService.createCustomFormula({
        name: formula,
        formula,
        format: 'number',
        description: '',
        adAccountId: context.adAccount.id,
      });

      // console.log('Custom metric formula saved:', {
      //   formula,
      //   adAccountId: context.adAccount.id,
      //   adAccountName: context.adAccount.name,
      //   sectionKey: context.sectionKey,
      // });
    } else {
      console.log('Custom metric formula saved:', formula);
    }

    this.closeCustomMetricBuilder();
  }

}
