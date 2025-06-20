import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MockData } from 'src/app/pages/schedule-report/schedule-report.component';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Metric } from 'src/app/services/api/report.service';
import Sortable from 'sortablejs';

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
export class EditReportContentComponent implements OnInit, OnDestroy {

  items = Array.from({ length: 16 }, (_, i) => `Item ${i + 1}`);
  
  private sortable: Sortable | null = null;

  @ViewChild('gridContainer', { static: false }) set gridContainer(el: ElementRef | undefined) {
    if (this.sortable) {
      this.sortable.destroy();
      this.sortable = null;
    }

    if (el) {
      this.sortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderItems(event),
      });
    }
  }

  @Input() reportSections: ReportSection[] = [];
  
  @Input() mockData: MockData | undefined = undefined;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngAfterViewInit() {
    // SortableJS initialization is now handled by the gridContainer setter.
  }

  reorderItems(event: Sortable.SortableEvent) {
    console.log(event)
    // const movedItem = this.items.splice(event.oldIndex!, 1)[0];
    // this.items.splice(event.newIndex!, 0, movedItem);
  }

  ngOnInit(): void {
    // this.generateMockData();
  }

  ngOnChanges() {
    if (this.reportSections) {
      this.reportSections.sort((a, b) => a.order - b.order);
    }
  }

  ngOnDestroy() {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }

  dropKPICard(event: CdkDragDrop<string[]>): void {
    const kpiSection = this.reportSections.find(s => s.key === 'kpis');
    if (kpiSection) {
      moveItemInArray(kpiSection.metrics, event.previousIndex, event.currentIndex);
    }
  }

}
