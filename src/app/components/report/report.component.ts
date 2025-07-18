import { Component, ElementRef, input, Input, model, SimpleChanges, ViewChild } from '@angular/core';
import { Data } from 'src/app/pages/schedule-report/schedule-report.component';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import Sortable from 'sortablejs';

export interface MetricSelections {
  kpis: Record<string, boolean>;
  graphs: Record<string, boolean>;
  ads: Record<string, boolean>;
  campaigns: Record<string, boolean>;
}
 
@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

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

    if (this.isViewMode()) {
      this.sectionsGridSortable?.option('disabled', true);
    }
  }

  @Input() reportSections: ReportSection[] = [];
  @Input() data: Data | undefined = undefined;
  @Input() reportTitle: string = 'Report Title';
  @Input() selectedDatePresetText: string = '';

  clientImageUrl = model<string>('');
  agencyImageUrl = model<string>('');

  clientImageGsUri = model<string>('');
  agencyImageGsUri = model<string>('');

  isViewMode = input<boolean>(false);

  reorderSections(event: Sortable.SortableEvent) {
    const movedSection = this.reportSections.splice(event.oldIndex!, 1)[0];
    this.reportSections.splice(event.newIndex!, 0, movedSection);
    this.reportSections.forEach((s, index) => s.order = index);
    this.reportSections.sort((a, b) => a.order - b.order);
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
    if (this.sectionsGridSortable) {
      this.sectionsGridSortable.destroy();
    }
  }

}
