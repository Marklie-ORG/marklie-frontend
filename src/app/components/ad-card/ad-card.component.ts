import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';
import { Metric } from 'src/app/services/api/report.service';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';

@Component({
  selector: 'ad-card',
  templateUrl: './ad-card.component.html',
  styleUrl: './ad-card.component.scss'
})
export class AdCardComponent {

  @Input() metrics: Metric[] = [];
  @Input() reportSections: ReportSection[] = [];
  @Input() ads: any[] = [];

  constructor(public metricsService: MetricsService) {
  }

  openAd(url: string): void {
    window.open(url, '_blank');
  }

}
