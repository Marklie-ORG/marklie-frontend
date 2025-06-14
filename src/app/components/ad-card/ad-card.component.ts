import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';

const EXCLUDED_METRICS = ['thumbnailUrl', 'sourceUrl', "adId", "adCreativeId", "id"]

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent {

  @Input() metrics: string[] = [];
  @Input() metricSelections: MetricSelections | undefined = undefined;
  // @Input() ad: any;
  @Input() ads: any[] = [];

  // metricsToDisplay: {label: string, value: any}[] = []

  constructor(public metricsService: MetricsService) {
    setTimeout(() => {
      console.log(this.metricSelections)
      // console.log(this.ad)
      // Object.keys(this.ad).forEach(key => {
      //   if (EXCLUDED_METRICS.includes(key)) return;
      //   this.metricsToDisplay.push({
      //     label: this.metricsService.formatMetricLabel(key),
      //     value: this.ad[key]
      //   })
      // })
    }, 1000);
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
