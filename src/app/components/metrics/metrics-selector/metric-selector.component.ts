import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-metric-selector',
  templateUrl: './metric-selector.component.html',
})
export class MetricSelectorComponent {
  @Input() availableMetrics: string[] = [];
  @Input() selectedMetrics: string[] = [];
  @Output() metricsChange = new EventEmitter<string[]>();

  onMetricsChange() {
    this.metricsChange.emit(this.selectedMetrics);
  }
}
