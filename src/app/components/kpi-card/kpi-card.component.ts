import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { Metric } from 'src/app/services/api/report.service';

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
