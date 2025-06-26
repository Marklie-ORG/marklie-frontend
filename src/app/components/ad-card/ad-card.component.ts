import { Component, ElementRef, Input, AfterViewInit, OnDestroy, QueryList, ViewChildren, SimpleChanges } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';
import { Metric } from 'src/app/services/api/report.service';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import Sortable from 'sortablejs';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent implements AfterViewInit, OnDestroy {

  private sortables: Sortable[] = [];

  @ViewChildren('adsGridContainer') gridContainers!: QueryList<ElementRef>;
  
  @Input() reportSections: ReportSection[] = [];
  @Input() ads: any[] = [];

  metrics: Metric[] = [];

  constructor(public metricsService: MetricsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportSections']) {
      this.metrics = this.reportSections.find(s => s.key === 'ads')?.metrics || [];
    }
  }

  ngAfterViewInit(): void {
    this.initSortables();
    this.gridContainers.changes.subscribe(() => {
      this.initSortables();
    });
  }

  ngOnDestroy(): void {
    this.destroySortables();
  }

  private initSortables(): void {
    this.destroySortables();
    this.gridContainers.forEach(container => {
      this.sortables.push(Sortable.create(container.nativeElement, {
        group: 'ad-metrics',
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderItems(event),
      }));
    });
  }

  private destroySortables(): void {
    this.sortables.forEach(s => s.destroy());
    this.sortables = [];
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

  reorderItems(event: Sortable.SortableEvent) {
    console.log(event)
    const adsSection = this.reportSections.find(s => s.key === 'ads');
    if (adsSection) {
      const movedItem = adsSection.metrics.splice(event.oldIndex!, 1)[0];
      adsSection.metrics.splice(event.newIndex!, 0, movedItem);
    }
    adsSection?.metrics.forEach((m, index) => m.order = index);

    console.log(this.reportSections.find(s => s.key === 'ads')?.metrics)
  }

}
