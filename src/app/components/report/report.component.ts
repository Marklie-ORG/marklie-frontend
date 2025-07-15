import {
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { ReportSection } from '../../pages/schedule-report/schedule-report.component.js';
import Sortable from 'sortablejs';

@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  @Input({ required: true }) reportSections!: ReportSection[];
  @Input({ required: true }) data!: any;
  @Input() mode: 'view' | 'edit' = 'view';

  @ViewChild('kpiGridContainer', { static: false }) kpiGridRef?: ElementRef;
  @ViewChild('sectionsGridContainer', { static: false }) sectionsGridRef?: ElementRef;

  reorderItems(event: Sortable.SortableEvent) {
    const kpiSection = this.reportSections.find(s => s.key === 'KPIs');
    if (kpiSection) {
      const movedItem = kpiSection.metrics.splice(event.oldIndex!, 1)[0];
      kpiSection.metrics.splice(event.newIndex!, 0, movedItem);
      kpiSection.metrics.forEach((m, index) => m.order = index);
    }
  }

  reorderSections(event: Sortable.SortableEvent) {
    const movedSection = this.reportSections.splice(event.oldIndex!, 1)[0];
    this.reportSections.splice(event.newIndex!, 0, movedSection);
    this.reportSections.forEach((s, index) => s.order = index);
    this.reportSections.sort((a, b) => a.order - b.order);
  }

  ngAfterViewInit(): void {
    if (this.mode === 'edit') {
      if (this.kpiGridRef?.nativeElement) {
        Sortable.create(this.kpiGridRef.nativeElement, {
          animation: 200,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          onEnd: (e) => this.reorderItems(e),
        });
      }

      if (this.sectionsGridRef?.nativeElement) {
        Sortable.create(this.sectionsGridRef.nativeElement, {
          animation: 200,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          onEnd: (e) => this.reorderSections(e),
        });
      }
    }
  }

}
