import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MetricSectionKey, ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'edit-metrics',
  templateUrl: './edit-metrics.component.html',
  styleUrl: './edit-metrics.component.scss'
})
export class EditMetricsComponent {

  @Input() reportSections: ReportSection[] = [];
  @Input() panelToggles: Record<MetricSectionKey, boolean> | undefined = undefined;

  @Input() metricSelections: MetricSelections | undefined = undefined;
  @Output() metricSelectionsChange = new EventEmitter<MetricSelections>();

  constructor(
    public metricsService: MetricsService
  ) {}

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

  onMetricsChange(): void {
    if (!this.metricSelections) return;
    const newSelections = { // explicitly copy the object so that it triggers changes in paremt component
      ...this.metricSelections
    };
    this.metricSelectionsChange.emit(newSelections);
  }
  
}
