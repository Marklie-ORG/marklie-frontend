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

  clientName: string = "";
  
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
    // this.facebookAdAccounts.set(this.data.client.facebookAdAccounts || []);
  }

  async ngOnInit() { }

  onInputBlur() {
    this.updateClient(this.clientName)
  }

  async updateClient(name?: string, emails?: string[], phoneNumbers?: string[]) {
    const client: UpdateClientRequest = {
      ...(name && { name }),
      ...(emails && { emails }),
      ...(phoneNumbers && { phoneNumbers })
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
