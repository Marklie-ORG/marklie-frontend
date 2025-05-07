import { Component, Input, SimpleChanges, OnInit, OnChanges, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs';
import { Root2 } from 'src/app/services/api/ad-accounts.service';
import { AdAccount } from 'src/app/services/api/ad-accounts.service';
import { AdAccountsService } from 'src/app/services/api/ad-accounts.service';
import { Client, ClientService, Conversations, UpdateClientRequest, Workspace } from 'src/app/services/api/client.service';
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

  clientForm: FormGroup;

  businesses: Root2[] = [];
  uniqueAdAccounts: AdAccount[] = [];
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {client: Client},
    private clientService: ClientService,
    private slackLoginService: SlackLoginService
  ) {
    this.clientForm = this.fb.group({
      name: [this.data.client.name, Validators.required],
      emails: this.fb.array([])
    });

    // Initialize emails if they exist
    if (this.data.client.emails && this.data.client.emails.length > 0) {
      this.data.client.emails.forEach(email => {
        this.addEmail(email);
      });
    } else {
      this.addEmail(); // Add one empty email field by default
    }
  }

  get emails() {
    return this.clientForm.get('emails') as FormArray;
  }

  addEmail(email: string = '') {
    const emailForm = this.fb.group({
      email: [email, [Validators.required, Validators.email]]
    });
    this.emails.push(emailForm);
  }

  removeEmail(index: number) {
    // console.log(index);
    // console.log(this.emails.length);
    // if (this.emails.length === 1) {
    //   this.emails.at(0).get('email')?.setValue('');
    //   return;
    // }
    this.emails.removeAt(index);

    
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
    // this.conversations = await this.clientService.getSlackAvailableConversations(this.data.client.uuid!);
    console.log(response);
  }

  async onConversationChange(id: string) {
    this.selectedConversationId = id;

    const response = await this.clientService.setSlackConversationId(this.data.client.uuid!, id);
    console.log(response);
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

  async onSubmit() {
    console.log(this.clientForm.value.emails)
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;
      const emails = formValue.emails.map((item: { email: string }) => item.email);
      await this.updateClient(
        formValue.name,
        emails
      );
      this.dialogRef.close();
    }
  }

  async updateClient(name: string, emails: string[]) {
    const client: UpdateClientRequest = {
      name: name,
      emails: emails
    }
    const response = await this.clientService.updateClient(this.data.client.uuid!, client);
  }
  

}
