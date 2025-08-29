import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Messages } from 'src/app/interfaces/interfaces';
import { ReportService } from 'src/app/services/api/report.service';
import { NotificationService } from 'src/app/services/notification.service';

export interface FinishReviewDialogData {
	reportUuid: string;
	messages: Messages;
}

@Component({
	selector: 'finish-review-dialog',
	templateUrl: './finish-review-dialog.component.html',
	styleUrl: './finish-review-dialog.component.scss'
})
export class FinishReviewDialogComponent {

	messages: Messages = {
		whatsapp: '',
		slack: '',
		email: { title: '', body: '' }
	};

	isSubmitting = false;

	constructor(
		public dialogRef: MatDialogRef<FinishReviewDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: FinishReviewDialogData,
		private reportService: ReportService,
		private notificationService: NotificationService
	) {
		this.messages = { ...data.messages, email: { ...data.messages?.email } } as Messages;
	}

	private buildSendAtString(): string {
		// Build a Temporal.PlainDateTime-compatible string (local time), e.g. 2025-08-20T14:30:00
		const date = new Date(Date.now() - 60_000); 
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
	}

	async onSend(): Promise<void> {
		if (this.isSubmitting) return;
		this.isSubmitting = true;
		try {
			await this.reportService.updateReportMessages(this.data.reportUuid, this.messages);
			const sendAt = this.buildSendAtString();
			this.reportService.sendAfterReview({ reportUuid: this.data.reportUuid, sendAt });
			this.notificationService.info('Report was saved and sent to the client');
			this.dialogRef.close(true);
		} catch (err) {
			console.error('Failed to send report after review:', err);
		} finally {
			this.isSubmitting = false;
		}
	}

	onCancel(): void {
		this.dialogRef.close(false);
	}
} 