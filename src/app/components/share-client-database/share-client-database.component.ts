import { Component, inject, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrganizationService } from '@services/api/organization.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-share-client-database',
  templateUrl: './share-client-database.component.html',
  styleUrl: './share-client-database.component.scss'
})
export class ShareClientDatabaseComponent {

  clientEmails = signal<string[]>(['']);

  private organizationService = inject(OrganizationService);
  private notificationService = inject(NotificationService);

  constructor(
    public dialogRef: MatDialogRef<ShareClientDatabaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clientUuid: string }
  ) {}

  addEmail(email: string = '') {
    this.clientEmails.set([...this.clientEmails(), email]);
  }

  removeEmail(index: number) {
    this.clientEmails.set(this.clientEmails().filter((_, i) => i !== index));
  }

  onEmailChange(index: number, value: string) {
    const next = [...this.clientEmails()];
    next[index] = value;
    this.clientEmails.set(next);
  }

  trackByIndex(index: number) {
    return index;
  }

  async share() {
    const trimmedEmails = this.clientEmails()
      .map(email => (email || '').trim())
      .filter(email => email.length > 0);

    if (trimmedEmails.length === 0) {
      return;
    }

    this.organizationService.shareClientDatabase(this.data.clientUuid, trimmedEmails)
    .then(() => {
      this.notificationService.info('Emails with access sent successfully');
      this.dialogRef.close();
    });
  }

}
