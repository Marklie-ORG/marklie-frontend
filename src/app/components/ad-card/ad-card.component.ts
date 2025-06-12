import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent {

  @Input() thumbnail: string = '';
  @Input() metrics: string[] = [];
  @Input() metricSelections: any;
  @Input() sourceUrl: string = '';
  @Input() ad: any;

  constructor(public metricsService: MetricsService) {}

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
