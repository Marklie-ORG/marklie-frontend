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

	async onSend(): Promise<void> {
		if (this.isSubmitting) return;
		this.isSubmitting = true;
		try {
			await this.reportService.updateReportMessages(this.data.reportUuid, this.messages);
			const res = await this.reportService.sendAfterReview({ reportUuid: this.data.reportUuid });
			this.notificationService.info(res.message || 'Report was saved and sent to the client');
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