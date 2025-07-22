import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-tag',
  templateUrl: './info-tag.component.html',
  styleUrls: ['./info-tag.component.scss']
})
export class InfoTagComponent {
  @Input() text: string = '';
} 