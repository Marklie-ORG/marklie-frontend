import { Component, Input } from '@angular/core';

@Component({
  selector: 'whatsapp-message-preview',
  templateUrl: './whatsapp-message-preview.component.html',
  styleUrl: './whatsapp-message-preview.component.scss'
})
export class WhatsappMessagePreviewComponent {

  @Input() message: string = '';
}
