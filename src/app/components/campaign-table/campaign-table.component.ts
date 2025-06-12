import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { MetricsService } from 'src/app/services/metrics.service';

@Component({
  selector: 'campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss'
})
export class CampaignTableComponent {

  @Input() campaignColumnOrder: string[] = [];
  @Input() campaigns: any[] = [];

  constructor(public metricsService: MetricsService) {}

  dropCampaignColumn(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.campaignColumnOrder, event.previousIndex, event.currentIndex);
  }
  
}
