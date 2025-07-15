import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import Sortable from 'sortablejs';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'edit-metrics',
  templateUrl: './edit-metrics.component.html',
  styleUrl: './edit-metrics.component.scss'
})
export class EditMetricsComponent implements OnInit, OnChanges {
  private sectionsSortable: Sortable | null = null;
  private metricsSortable: Sortable | null = null;

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

  @ViewChild('metricsContainer', { static: false }) set metricsContainer(el: ElementRef | undefined) {
    if (this.metricsSortable) {
      this.metricsSortable.destroy();
      this.metricsSortable = null;
    }

    if (el) {
      this.metricsSortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderMetrics(event),
      });
    }
  }

  @Input() reportSections: ReportSection[] = [];
  @Output() reportSectionsChange = new EventEmitter<ReportSection[]>();
  @Input() reportTitle: string | undefined = undefined;
  @Output() reportTitleChange = new EventEmitter<string>();

  expandedSections: boolean[] = [];

  toggles: { [key: string]: boolean } = {
    main: true,
    header: false,
    kpis: false,
    graphs: false,
    ads: false,
    campaigns: false
  };

  mainKPIs: ReportSection | undefined = undefined;
  graphs: ReportSection | undefined = undefined;
  bestCreatives: ReportSection | undefined = undefined;
  bestCampaigns: ReportSection | undefined = undefined;

  ngOnInit(): void {
    console.log(this.reportSections);
    this.initializeSections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportSections'] && this.reportSections) {
      this.initializeSections();
    }
  }

  private initializeSections(): void {
    if (!this.reportSections || this.reportSections.length === 0) {
      return; // If no sections are available, skip initialization
    }

    this.expandedSections = new Array(this.reportSections.length).fill(false);
    this.mainKPIs = this.reportSections.find(section => section.key === 'KPIs');
    this.graphs = this.reportSections.find(section => section.key === 'graphs');
    this.bestCreatives = this.reportSections.find(section => section.key === 'ads');
    this.bestCampaigns = this.reportSections.find(section => section.key === 'campaigns');
  }

  togglePage(page: string): void {
    this.toggles[page] = !this.toggles[page];
    Object.keys(this.toggles).forEach(key => {
      if (key !== page) {
        this.toggles[key] = false;
      }
    });
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
      // If all metrics are disabled, disable the section
      if (!section.metrics.map(metric => metric.enabled).includes(true)) {
        section.enabled = false;
      } else if (!section.enabled && section.metrics.map(metric => metric.enabled).includes(true)) {
        section.enabled = true;
      }
    });

    // Create a new array to trigger change detection
    const reportSections: ReportSection[] = [...this.reportSections];
    this.reportSectionsChange.emit(reportSections);
  }

  reorderSections(event: Sortable.SortableEvent): void {
    const movedSection = this.reportSections.splice(event.oldIndex!, 1)[0];
    this.reportSections.splice(event.newIndex!, 0, movedSection);
    this.reportSections.forEach((section, index) => section.order = index);
    this.reportSections.sort((a, b) => a.order - b.order);
    this.reportSectionsChange.emit([...this.reportSections]);
  }

  reorderMetrics(event: Sortable.SortableEvent): void {
    const section = this.reportSections[event.from.dataset.sectionIndex as any];
    const movedMetric = section.metrics.splice(event.oldIndex!, 1)[0];
    section.metrics.splice(event.newIndex!, 0, movedMetric);
    section.metrics.forEach((metric, index) => metric.order = index);
    this.reportSectionsChange.emit([...this.reportSections]);
  }

}
