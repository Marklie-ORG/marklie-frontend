import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Messages } from 'src/app/interfaces/interfaces';

@Component({
	selector: 'messages-accordion',
	templateUrl: './messages-accordion.component.html',
	styleUrl: './messages-accordion.component.scss'
})
export class MessagesAccordionComponent {
	@Input() messages!: Messages;
	@Output() messagesChange = new EventEmitter<Messages>();

	accordion: { whatsapp: boolean; slack: boolean; email: boolean } = {
		whatsapp: true,
		slack: true,
		email: true
	};

	onWhatsappChange(value: string): void {
		this.messages.whatsapp = value;
		this.messagesChange.emit(this.messages);
	}

	onSlackChange(value: string): void {
		this.messages.slack = value;
		this.messagesChange.emit(this.messages);
	}

	onEmailTitleChange(value: string): void {
		this.messages.email.title = value;
		this.messagesChange.emit(this.messages);
	}

	onEmailBodyChange(value: string): void {
		this.messages.email.body = value;
		this.messagesChange.emit(this.messages);
	}
} 