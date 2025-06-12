import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss'
})
export class KpiCardComponent {

  @Input() metric: string = '';
  @Input() value: any = '';

  constructor(
    public metricsService: MetricsService
  ) {}
}
