import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  readonly requests = signal<ClientAccessRequest[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly sharingRequestUuid = signal<string | null>(null);

  readonly hasRequests = computed(() => this.requests().length > 0);
  readonly canShowTable = computed(
    () => !this.isLoading() && !this.error() && this.hasRequests()
  );
  readonly showEmptyState = computed(
    () => !this.isLoading() && !this.error() && !this.hasRequests()
  );

  readonly columnWidths = {
    email: '26%',
    client: '22%',
    status: '16%',
    requested: '20%',
    actions: '16%',
  };

  private organizationService = inject(OrganizationService);
  private notificationService = inject(NotificationService);

  async ngOnInit(): Promise<void> {
    try {
      const requests = await this.organizationService.getClientAccessRequests();
      this.requests.set(requests);
    } catch (err) {
      console.error('Failed to load client access requests', err);
      this.error.set('Unable to load access requests right now. Please try again later.');
    } finally {
      this.isLoading.set(false);
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
      this.notificationService.info('Client information is missing for this request.');
      return;
    }

    this.sharingRequestUuid.set(request.uuid);

    try {
      await this.organizationService.shareClientDatabase(
        request.organizationClient.uuid,
        [request.email],
      );

      this.notificationService.info('Access email sent successfully.');
    } catch (err) {
      console.error('Failed to share client access', err);
      this.notificationService.info('Failed to share access. Please try again.');
    } finally {
      this.sharingRequestUuid.set(null);
    }
  }

  isSharingRequest(request: ClientAccessRequest): boolean {
    return this.sharingRequestUuid() === request.uuid;
  }

  isActionDisabled(request: ClientAccessRequest): boolean {
    return this.isSharingRequest(request) || !request.organizationClient?.uuid;
  }

}
