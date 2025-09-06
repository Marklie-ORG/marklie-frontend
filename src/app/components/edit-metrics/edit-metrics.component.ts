import { Component, effect, ElementRef, EventEmitter, Input, model, Output, ViewChild } from '@angular/core';
import Sortable from 'sortablejs';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { MetricsService } from 'src/app/services/metrics.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Metric } from 'src/app/interfaces/report-sections.interfaces';

@Component({
  selector: 'edit-metrics',
  templateUrl: './edit-metrics.component.html',
  styleUrl: './edit-metrics.component.scss'
})
export class EditMetricsComponent {

  private sectionsSortable: Sortable | null = null;

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
    private notificationService: NotificationService
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
      this.selectedAdAccountId = '';
      return;
    }
    this.toggles[page] = !this.toggles[page];

    Object.keys(this.toggles).forEach(key => {
      if (key !== page) {
        this.toggles[key] = false;
      }
    });
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

  onObligatoryMetricClick(event: MouseEvent, sectionKey: string, metric: Metric): void {
    if (sectionKey === 'ads' && metric.name === 'impressions') {
      event.preventDefault();
      event.stopPropagation();
      this.notificationService.info('This metric is necessary for the report to get generated. You cannot remove it.');
    }
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

}
