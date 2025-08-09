import { Component, Input, SimpleChanges, OnInit, OnChanges, Inject, Renderer2, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs';
import { Root2 } from 'src/app/services/api/ad-accounts.service';
import { AdAccount } from 'src/app/services/api/ad-accounts.service';
import { AdAccountsService } from 'src/app/services/api/ad-accounts.service';
import { Client, ClientService, Conversations, UpdateClientRequest, Workspace } from 'src/app/services/api/client.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SlackLoginService } from 'src/app/services/slack-login.service';
@Component({
  selector: 'app-client-settings',
  templateUrl: './client-settings.component.html',
  styleUrl: './client-settings.component.scss'
})
export class ClientSettingsComponent implements OnInit {
  businesses: Root2[] = [];
  uniqueAdAccounts: AdAccount[] = [];

  activeTab: "comm_channels" | "ad_platform" = "comm_channels";

  clientName: string = "";
  
  emails = signal<string[]>([]);
  phoneNumbers = signal<string[]>([]);

  constructor(
    public dialogRef: MatDialogRef<ClientSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {client: Client},
    private clientService: ClientService,
    private notificationService: NotificationService,
  ) {
    
    this.clientName = this.data.client.name;
    this.emails.set(this.data.client.emails);
    this.phoneNumbers.set(this.data.client.phoneNumbers);
    
    effect(() => {
      console.log(this.emails())
      console.log(this.phoneNumbers())
    })

  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['emails']) {
  //     console.log(this.emails)  
  //   }
  //   if (changes['phoneNumbers']) {
  //     console.log(this.phoneNumbers)
  //   }
  // }

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
