import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MetricSectionKey, ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { MetricSelections } from '../edit-report-tmp/edit-report-tmp.component';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-edit-metrics-tmp',
  templateUrl: './edit-metrics-tmp.component.html',
  styleUrl: './edit-metrics-tmp.component.scss'
})
export class EditMetricsTmpComponent {

  @Input() reportSections: ReportSection[] = [];
  @Input() panelToggles: Record<MetricSectionKey, boolean> | undefined = undefined;
  @Input() metricSelections: MetricSelections | undefined = undefined;

  @Output() onPanelToggleChange = new EventEmitter<void>();
  @Output() onMetricSelectionChange = new EventEmitter<void>();

  formatMetricLabel(metric: string): string {
    return metric
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase());
  }
  

  dropMetric(event: CdkDragDrop<string[]>, sectionIndex: number): void {
    const section = this.reportSections[sectionIndex];
    if (event.previousContainer === event.container) {
      moveItemInArray(section.metrics, event.previousIndex, event.currentIndex);
    } else {
      const from = this.reportSections.findIndex(s => s.metrics === event.previousContainer.data);
      if (from !== -1) {
        transferArrayItem(this.reportSections[from].metrics, section.metrics, event.previousIndex, event.currentIndex);
      }
    }
  }
  
}
