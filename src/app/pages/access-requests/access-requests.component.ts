import { Component, OnInit, inject } from '@angular/core';
import {
  ClientAccessRequest,
  OrganizationService,
} from '@services/api/organization.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-access-requests',
  templateUrl: './access-requests.component.html',
  styleUrl: './access-requests.component.scss'
})
export class AccessRequestsComponent implements OnInit {
  requests: ClientAccessRequest[] = [];
  isLoading = true;
  error: string | null = null;
  sharingRequestUuid: string | null = null;

  private organizationService = inject(OrganizationService);
  private notificationService = inject(NotificationService);

  async ngOnInit(): Promise<void> {
    try {
      this.requests = await this.organizationService.getClientAccessRequests();
    } catch (err) {
      console.error('Failed to load client access requests', err);
      this.error = 'Unable to load access requests right now. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async shareAccess(request: ClientAccessRequest): Promise<void> {
    if (!request.organizationClient?.uuid) {
      this.notificationService.error('Client information is missing for this request.');
      return;
    }

    this.sharingRequestUuid = request.uuid;

    try {
      await this.organizationService.shareClientDatabase(
        request.organizationClient.uuid,
        [request.email],
      );

      this.notificationService.success('Access email sent successfully.');
    } catch (err) {
      console.error('Failed to share client access', err);
      this.notificationService.error('Failed to share access. Please try again.');
    } finally {
      this.sharingRequestUuid = null;
    }
  }

}
