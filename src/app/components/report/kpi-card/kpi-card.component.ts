import { Component, Input } from '@angular/core';
import { MetricsService } from '../../../services/metrics.service.js';
import { Metric } from '../../../services/api/report.service.js';

@Component({
  selector: 'kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss'
})
export class KpiCardComponent {

  @Input() metric: Metric = { name: '', order: 0, enabled: false };
  @Input() value: any = '';

  constructor(
    public metricsService: MetricsService
  ) {}
}
