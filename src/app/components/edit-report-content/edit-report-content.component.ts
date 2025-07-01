import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Data } from 'src/app/pages/schedule-report/schedule-report.component';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Sortable from 'sortablejs';
import { Metric } from 'src/app/services/api/report.service';

export interface MetricSelections {
  kpis: Record<string, boolean>;
  graphs: Record<string, boolean>;
  ads: Record<string, boolean>;
  campaigns: Record<string, boolean>;
}

@Component({
  selector: 'edit-report-content',
  templateUrl: './edit-report-content.component.html',
  styleUrl: './edit-report-content.component.scss'
})
export class EditReportContentComponent implements OnInit, OnDestroy, OnChanges {
  
  private kpiGridSortable: Sortable | null = null;

  @ViewChild('kpiGridContainer', { static: false }) set kpiGridContainer(el: ElementRef | undefined) {
    if (this.kpiGridSortable) {
      this.kpiGridSortable.destroy();
      this.kpiGridSortable = null;
    }

    if (el) {
      this.kpiGridSortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderItems(event),
      });
    }
  }

  private sectionsGridSortable: Sortable | null = null;

  @ViewChild('sectionsGridContainer', { static: false }) set sectionsGridContainer(el: ElementRef | undefined) {
    if (this.sectionsGridSortable) {
      this.sectionsGridSortable.destroy();
      this.sectionsGridSortable = null;
    }

    if (el) {
      this.sectionsGridSortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderSections(event),
      });
    }
  }

  @Input() reportSections: ReportSection[] = [];
  @Input() data: Data | undefined = undefined;
  @Input() reportTitle: string = 'Report Title';

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  reorderItems(event: Sortable.SortableEvent) {
    const kpiSection = this.reportSections.find(s => s.key === 'kpis');
    if (kpiSection) {
      const movedItem = kpiSection.metrics.splice(event.oldIndex!, 1)[0];
      kpiSection.metrics.splice(event.newIndex!, 0, movedItem);
    }
    kpiSection?.metrics.forEach((m, index) => m.order = index);

    console.log(this.reportSections.find(s => s.key === 'kpis')?.metrics)
  }

  reorderSections(event: Sortable.SortableEvent) {
    const movedSection = this.reportSections.splice(event.oldIndex!, 1)[0];
    this.reportSections.splice(event.newIndex!, 0, movedSection);
    this.reportSections.forEach((s, index) => s.order = index);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reportSections'] && this.reportSections) {
      this.reportSections.sort((a, b) => a.order - b.order);
      this.reportSections.forEach(section => {
          section.metrics.sort((a, b) => a.order - b.order);
      });
    }
  }

  ngOnDestroy() {
    if (this.kpiGridSortable) {
      this.kpiGridSortable.destroy();
    }
    if (this.sectionsGridSortable) {
      this.sectionsGridSortable.destroy();
    }
  }

}
