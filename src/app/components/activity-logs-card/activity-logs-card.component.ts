import { Component, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-activity-log-item',
  templateUrl: './activity-logs-card.component.html',
  styleUrls: ['./activity-logs-card.component.scss']
})
export class LogsCardComponent {
  @Input() log: any;
  @Input() formatTimeOrDate!: (timestamp: string) => string;

  faCircle: IconDefinition = faCircle;
  faCircleDot: IconDefinition = faCircleDot;


}
