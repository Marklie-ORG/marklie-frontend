import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import Sortable from 'sortablejs';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { MetricsService } from 'src/app/services/metrics.service';

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

  @Input() reportSections: ReportSection[] = [];
  @Output() reportSectionsChange = new EventEmitter<ReportSection[]>();
  @Input() reportTitle: string | undefined = undefined;
  @Output() reportTitleChange = new EventEmitter<string>();


  // Track which sections are expanded in the accordion
  expandedSections: boolean[] = [];

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

  constructor(
    public metricsService: MetricsService
  ) {}

  togglePage(page: string): void {
    this.toggles[page] = !this.toggles[page];

    Object.keys(this.toggles).forEach(key => {
      if (key !== page) {
        this.toggles[key] = false;
      }
    });
  }

  ngOnInit(): void {
    // Initialize all sections as collapsed by default
    this.expandedSections = new Array(this.reportSections.length).fill(false);
  }

  ngOnChanges(): void {
    // Update expandedSections array when reportSections changes
    if (this.reportSections && this.reportSections.length !== this.expandedSections.length) {
      this.expandedSections = new Array(this.reportSections.length).fill(false);
    }
    if (this.reportSections) {
      this.mainKPIs = this.reportSections.find(section => section.key === 'kpis');
      console.log(this.mainKPIs)

      this.graphs = this.reportSections.find(section => section.key === 'graphs');
      this.bestCreatives = this.reportSections.find(section => section.key === 'ads');
      this.bestCampaigns = this.reportSections.find(section => section.key === 'campaigns');
    }
  }

  toggleSection(index: number): void {
    this.expandedSections[index] = !this.expandedSections[index];
  }

  isSectionExpanded(index: number): boolean {
    return this.expandedSections[index];
  }

  onMetricsChange(): void {
    if (!this.reportSections.length) return;


    this.reportSections.forEach(section => {
      if (!section.metrics.map(metric => metric.enabled).includes(true)) section.enabled = false; // if all metrics are disabled, disable the section
      else if (!section.enabled && section.metrics.map(metric => metric.enabled).includes(true)) section.enabled = true; // if any metric is enabled, enable the section
    });

    const reportSections: ReportSection[] = [ // explicitly copy the object so that it triggers changes in paremt component
      ...this.reportSections
    ];
    this.reportSectionsChange.emit(reportSections);
  }

  reorderSections(event: Sortable.SortableEvent) {
    const movedSection = this.reportSections.splice(event.oldIndex!, 1)[0];
    this.reportSections.splice(event.newIndex!, 0, movedSection);
    this.reportSections.forEach((s, index) => s.order = index);
    this.reportSections.sort((a, b) => a.order - b.order);
  }

}
