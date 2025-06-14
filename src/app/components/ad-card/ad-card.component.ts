import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent {

  @Input() metrics: string[] = [];
  @Input() metricSelections: MetricSelections | undefined = undefined;
  @Input() ads: any[] = [];

  constructor(public metricsService: MetricsService) {
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
