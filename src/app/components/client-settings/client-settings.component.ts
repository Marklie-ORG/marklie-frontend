import { Component, OnInit, Inject, signal, effect } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Business } from 'src/app/services/api/ad-accounts.service';
import { AdAccount } from 'src/app/services/api/ad-accounts.service';
import { Client, ClientService, UpdateClientRequest } from 'src/app/services/api/client.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FacebookAdAccount } from '../ad-accounts-settings/ad-accounts-settings.component';

@Component({
  selector: 'app-client-settings',
  templateUrl: './client-settings.component.html',
  styleUrl: './client-settings.component.scss'
})
export class ClientSettingsComponent implements OnInit {
  businesses: Business[] = [];
  uniqueAdAccounts: AdAccount[] = [];

  activeTab: "comm_channels" | "ad_platform" = "comm_channels";

  // Ensure each tab's network requests happen only once, when the tab is first opened
  isCommTabLoaded = true;
  isAdTabLoaded = false;

  clientName: string = "";

  selectedBusinessId: string | null = null;
  
  emails = signal<string[]>([]);
  phoneNumbers = signal<string[]>([]);
  facebookAdAccounts = signal<FacebookAdAccount[]>([]);

  constructor(
    public dialogRef: MatDialogRef<ClientSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {client: Client},
    private clientService: ClientService,
    private notificationService: NotificationService,
  ) {
    console.log(this.data)
    this.clientName = this.data.client.name;
    this.emails.set(this.data.client.emails);
    this.phoneNumbers.set(this.data.client.phoneNumbers);
    this.selectedBusinessId = this.data.client.adAccounts[0].businessId;
    console.log(this.selectedBusinessId)
    // Initialize facebookAdAccounts if present on client
    if (this.data.client.adAccounts && this.data.client.adAccounts.length > 0) {
      this.facebookAdAccounts.set(this.data.client.adAccounts);
      console.log(this.facebookAdAccounts())
    }
  }

  async ngOnInit() { }

  selectTab(tab: "comm_channels" | "ad_platform") {
    this.activeTab = tab;
    if (tab === 'ad_platform' && !this.isAdTabLoaded) {
      this.isAdTabLoaded = true;
    }
  }

  onInputBlur() {
    this.updateClient(this.clientName)
  }

  async updateClient(name?: string, emails?: string[], phoneNumbers?: string[]) {
    const client: UpdateClientRequest = {
      ...(name && { name }),
      ...(emails && { emails }),
      ...(phoneNumbers && { phoneNumbers }),
      facebookAdAccounts: this.facebookAdAccounts()
    }
    try {
      const response = await this.clientService.updateClient(this.data.client.uuid!, client);
      this.notificationService.info('Information updated successfully');
    } catch (error) {
      this.notificationService.info('Error updating Information');
    }
  }

  saveChanges() {
    this.updateClient(
      this.clientName, 
      this.emails(), 
      this.phoneNumbers()
    );
    this.dialogRef.close();
  }


}
