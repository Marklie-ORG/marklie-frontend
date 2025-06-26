import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'edit-metrics',
  templateUrl: './edit-metrics.component.html',
  styleUrl: './edit-metrics.component.scss'
})
export class EditMetricsComponent {

  @Input() reportSections: ReportSection[] = [];
  @Output() reportSectionsChange = new EventEmitter<ReportSection[]>();

  constructor(
    public metricsService: MetricsService
  ) {}

  onMetricsChange(): void {
    console.log("onMetricsChange");
    if (!this.reportSections.length) return;
    const reportSections: ReportSection[] = [ // explicitly copy the object so that it triggers changes in paremt component
      ...this.reportSections
    ];
    this.reportSectionsChange.emit(reportSections);
  }
  
}
