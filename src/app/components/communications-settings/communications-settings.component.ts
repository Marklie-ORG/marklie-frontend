import { Component, effect, inject, input, model, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ClientService, Conversations, Workspace } from 'src/app/services/api/client.service';
import { SlackLoginService } from 'src/app/services/slack-login.service';

@Component({
  selector: 'communications-settings',
  templateUrl: './communications-settings.component.html',
  styleUrl: './communications-settings.component.scss'
})
export class CommunicationsSettingsComponent {

  slackConversationId = input<string>('');
  clientUuid = input<string>('');

  clientEmails = model<string[]>([]);
  clientPhoneNumbers = model<string[]>([]);

  selectedConversationId: string | null = null;
  workspaces: Workspace[] | null = null;
  currentWorkspace: Workspace | null = null;
  currentWorkspaceTokenId: string | null = null;
  conversations: Conversations | null = null;

  private isSlackWorkspaceConnectedSubject = new BehaviorSubject<boolean>(false);
  isSlackWorkspaceConnected$ = this.isSlackWorkspaceConnectedSubject.asObservable();
  private subscriptions: Subscription[] = [];

  renderer = inject(Renderer2)
  clientService = inject(ClientService)
  slackLoginService = inject(SlackLoginService)

  constructor() {
    effect(async () => {

      this.selectedConversationId = this.slackConversationId();

      if (this.clientUuid()) {
        await this.getWorkspaces();
      }

      this.subscriptions.push(
        this.isSlackWorkspaceConnectedSubject.subscribe(async (status) => {
          if (status) {
            this.conversations = await this.clientService.getSlackAvailableConversations(this.clientUuid());
            console.log(this.conversations)
          }
        })
      );

      // if user are
      if (this.slackConversationId()) {
        this.isSlackWorkspaceConnectedSubject.next(true);
      }
      else {
        this.loadIsSlackWorkspaceConnected();
      }

    })

    // effect(async () => {
    //   this.emails = this.clientEmails() ?
    //     this.clientEmails().map(email => ({email: email})) : [];
    //   this.phoneNumbers = this.clientPhoneNumbers() ?
    //     this.clientPhoneNumbers().map(phoneNumber => ({phoneNumber: phoneNumber})) : [];
    // })
  }

  async ngOnInit() {}

  private async loadIsSlackWorkspaceConnected() {
    if (!this.clientUuid()) {
      return;
    }
    const status = await this.clientService.getIsSlackWorkspaceConnected(this.clientUuid());
    this.isSlackWorkspaceConnectedSubject.next(status.isConnected);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async getWorkspaces() {
    this.workspaces = await this.clientService.getConnectedWorkspaces(this.clientUuid());

    this.currentWorkspace = this.workspaces?.find(workspace => workspace.clientId === this.clientUuid()) || null;
    this.currentWorkspaceTokenId = this.currentWorkspace?.tokenId || null;
  }

  async onWorkspaceTokenIdChange(tokenId: string) {
    this.currentWorkspace = this.workspaces?.find(workspace => workspace.tokenId === tokenId) || null;
    this.currentWorkspaceTokenId = tokenId;

    const response = await this.clientService.setSlackWorkspaceToken(this.clientUuid(), tokenId);
    this.isSlackWorkspaceConnectedSubject.next(true);
    this.selectedConversationId = null;
    await this.getWorkspaces();
  }

  async onConversationChange(id: string) {
    this.selectedConversationId = id;

    const response = await this.clientService.setSlackConversationId(this.clientUuid(), id);
  }

  connectSlack() {
    if (!this.clientUuid()) {
      return;
    }
    this.slackLoginService.connectSlack(this.clientUuid());
  }

  addEmail(email: string = '') {
    this.clientEmails.set([...this.clientEmails(), email]);

    console.log(this.clientEmails)

    // this.propagateChanges();  
  }

  // propagateChanges() {
  //   this.clientEmails.set(this.emails.map(email => email.email));
  //   this.clientPhoneNumbers.set(this.phoneNumbers.map(phoneNumber => phoneNumber.phoneNumber));
  // }

  removeEmail(index: number) {
    this.clientEmails.set(this.clientEmails().filter((_, i) => i !== index));

    // this.propagateChanges();
  }

  addPhoneNumber(phoneNumber: string = '') {
    this.clientPhoneNumbers.set([...this.clientPhoneNumbers(), phoneNumber]);
  }

  removePhoneNumber(index: number) {
    this.clientPhoneNumbers.set(this.clientPhoneNumbers().filter((_, i) => i !== index));
  }

  onEmailChange(index: number, value: string) {
    const next = [...this.clientEmails()];
    next[index] = value;
    this.clientEmails.set(next);
  }

  onPhoneNumberChange(index: number, value: string) {
    const next = [...this.clientPhoneNumbers()];
    next[index] = value;
    this.clientPhoneNumbers.set(next);
  }

  trackByIndex(index: number) {
    return index;
  }

}
