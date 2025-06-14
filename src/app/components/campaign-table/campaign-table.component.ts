import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';

@Component({
  selector: 'campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss'
})
export class CampaignTableComponent {

  @Input() metrics: string[] = [];
  @Input() metricSelections: MetricSelections | undefined = undefined;
  @Input() campaigns: any[] = [];

  constructor(public metricsService: MetricsService) {
    setTimeout(() => {
      console.log(this.metrics)
      console.log(this.metricSelections)
      console.log(this.campaigns)
    }, 1000);
  }

  dropCampaignColumn(event: CdkDragDrop<string[]>): void {
    // moveItemInArray(this.campaignColumnOrder, event.previousIndex, event.currentIndex);
  }
  
}
