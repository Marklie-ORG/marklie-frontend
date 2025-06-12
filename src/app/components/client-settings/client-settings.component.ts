import { Component, Input, SimpleChanges, OnInit, OnChanges, Inject, Renderer2 } from '@angular/core';
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

  conversations: Conversations | null = null;
  selectedConversationId: string | null = null;

  workspaces: Workspace[] | null = null;
  currentWorkspace: Workspace | null = null;
  currentWorkspaceTokenId: string | null = null;

  private isSlackWorkspaceConnectedSubject = new BehaviorSubject<boolean>(false);
  isSlackWorkspaceConnected$ = this.isSlackWorkspaceConnectedSubject.asObservable();
  private subscriptions: Subscription[] = [];

  businesses: Root2[] = [];
  uniqueAdAccounts: AdAccount[] = [];

  activeTab: "comm_channels" | "ad_platform" = "comm_channels";

  clientName: string = "";
  emails: {email: string, isEditMode: boolean}[] = [];
  phoneNumbers: {phoneNumber: string, isEditMode: boolean}[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {client: Client},
    private clientService: ClientService,
    private slackLoginService: SlackLoginService,
    private notificationService: NotificationService,
    private renderer: Renderer2
  ) {

    this.clientName = this.data.client.name;
    this.emails = this.data.client.emails ? 
      this.data.client.emails.map(email => ({email: email, isEditMode: false})) : [];
    this.phoneNumbers = this.data.client.phoneNumbers ? 
      this.data.client.phoneNumbers.map(phoneNumber => ({phoneNumber: phoneNumber, isEditMode: false})) : [];

    // // Initialize emails if they exist
    // if (this.data.client.emails && this.data.client.emails.length > 0) {
    //   this.data.client.emails.forEach(email => {
    //     this.addEmail(email);
    //   });
    // } else {
    //   this.addEmail(); // Add one empty email field by default
    // }

    // // Initialize phoneNumbers if they exist
    // if (this.data.client.phoneNumbers && this.data.client.phoneNumbers.length > 0) {
    //   this.data.client.phoneNumbers.forEach(phoneNumber => {
    //     this.addPhoneNumber(phoneNumber);
    //   });
    // } else {
    //   this.addPhoneNumber(); // Add one empty email field by default
    // }

  }

  // async onSubmit() {
    
  //   if (this.clientForm.valid) {
  //     const formValue = this.clientForm.value;
  //     const emails = formValue.emails.map((item: { email: string }) => item.email);
  //     const phoneNumbers = formValue.phoneNumbers.map((item: { phoneNumber: string }) => item.phoneNumber);
  //     await this.updateClient(
  //       formValue.name,
  //       emails,
  //       phoneNumbers
  //     );
  //     this.dialogRef.close();
  //   }
  // }

  // get emails() {
  //   return this.clientForm.get('emails') as FormArray;
  // }

  // get phoneNumbers() {
  //   return this.clientForm.get('phoneNumbers') as FormArray;
  // }

  onInputBlur() {
    console.log(this.clientName)
    this.updateClient(this.clientName)
  }

  addEmail(email: string = '') {
    this.emails.push({email: email, isEditMode: true});
    this.focusInput('email' + (this.emails.length - 1));
  }

  removeEmail(index: number) {
    this.emails.splice(index, 1);
  }

  addPhoneNumber(phoneNumber: string = '') {
    this.phoneNumbers.push({phoneNumber: phoneNumber, isEditMode: true});
    this.focusInput('phoneNumber' + (this.phoneNumbers.length - 1));
  }

  removePhoneNumber(index: number) {
    this.phoneNumbers.splice(index, 1);
  }

  onEmailBlur(index: number) {
    this.emails[index].isEditMode = false;
    if (this.emails[index].email.trim() === '') {
      this.removeEmail(index);
    }
  }

  onPhoneNumberBlur(index: number) {
    this.phoneNumbers[index].isEditMode = false;
    if (this.phoneNumbers[index].phoneNumber.trim() === '') {
      this.removePhoneNumber(index);
    }
  }

  async ngOnInit() {

    
    // try {
    //   this.businesses = await this.adAccountsService.getBusinessesHierarchy();
    //   const adAccounts = this.businesses.map(business => business.ad_accounts);
    //   const flattenedAdAccounts = adAccounts.flat();
    //   this.uniqueAdAccounts = [...new Map(flattenedAdAccounts.map(account => [account.id, account])).values()];
    // } catch (error) {
    //   console.error('Error fetching businesses:', error);
    // }

    this.selectedConversationId = this.data.client.slackConversationId;

    await this.getWorkspaces();

    this.subscriptions.push(
      this.isSlackWorkspaceConnectedSubject.subscribe(async (status) => {
        if (status) {
          this.conversations = await this.clientService.getSlackAvailableConversations(this.data.client.uuid!);
          console.log(this.conversations)
        }
      })
    );
    
    // if user are
    if (this.data.client.slackConversationId) {
      this.isSlackWorkspaceConnectedSubject.next(true);
    }
    else {
      this.loadIsSlackWorkspaceConnected();
    }

    
  }

  async getWorkspaces() {
    this.workspaces = await this.clientService.getConnectedWorkspaces(this.data.client.uuid!);
    this.currentWorkspace = this.workspaces?.find(workspace => workspace.clientId === this.data.client.uuid) || null;
    this.currentWorkspaceTokenId = this.currentWorkspace?.tokenId || null;
  }

  private async loadIsSlackWorkspaceConnected() {
    if (!this.data.client.uuid) {
      return;
    }
    const status = await this.clientService.getIsSlackWorkspaceConnected(this.data.client.uuid);
    this.isSlackWorkspaceConnectedSubject.next(status.isConnected);
  }

  async onWorkspaceTokenIdChange(tokenId: string) {
    this.currentWorkspace = this.workspaces?.find(workspace => workspace.tokenId === tokenId) || null;
    this.currentWorkspaceTokenId = tokenId;

    const response = await this.clientService.setSlackWorkspaceToken(this.data.client.uuid!, tokenId);
    this.isSlackWorkspaceConnectedSubject.next(true);
    this.selectedConversationId = null;
    await this.getWorkspaces();
  }

  async onConversationChange(id: string) {
    this.selectedConversationId = id;

    const response = await this.clientService.setSlackConversationId(this.data.client.uuid!, id);
  }

  connectSlack() {
    if (!this.data.client.uuid) {
      return;
    }
    this.slackLoginService.connectSlack(this.data.client.uuid!);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  focusInput(inputId: string) {
    setTimeout(() => {
      const input = this.renderer.selectRootElement(`#${inputId}`, true);
      console.log(input)
      input.focus();
    }, 50);
  }

  saveChanges() {
    this.updateClient(this.clientName, this.emails.map(email => email.email), this.phoneNumbers.map(phoneNumber => phoneNumber.phoneNumber));
    this.dialogRef.close();
  }
  

}
