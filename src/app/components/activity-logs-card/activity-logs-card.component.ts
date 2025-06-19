import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ClientService, Conversations } from '../../services/api/client.service.js';

@Component({
  selector: 'app-activity-log-item',
  templateUrl: './activity-logs-card.component.html',
  styleUrls: ['./activity-logs-card.component.scss']
})
export class LogsCardComponent implements OnInit, OnChanges {
  @Input() logs: any[] = [];
  @Input() level?: string;
  @Input() formatTimeOrDate!: (timestamp: string) => string;

  seenLogIds = new Set<string>();
  groupedLogs: any[] = [];

  private conversationCache = new Map<string, Conversations>();

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    const seen = localStorage.getItem('seenLogs');
    this.seenLogIds = new Set(seen ? JSON.parse(seen) : []);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['logs'] && this.logs?.length > 0) {
      await this.processLogs();
    }
  }

  async processLogs() {
    const groupedMap = new Map<string, any>();
    this.groupedLogs = [];

    for (const log of this.logs) {
      if (log.action === 'report_sent' && log.targetUuid) {
        const clientId = log.client?.uuid;
        if (!clientId) continue;

        let conversations: Conversations;

        if (this.conversationCache.has(clientId)) {
          conversations = this.conversationCache.get(clientId)!;
        } else {
          try {
            conversations = await this.clientService.getSlackAvailableConversations(clientId);
            this.conversationCache.set(clientId, conversations);
          } catch (err) {
            console.error(`Failed to fetch conversations for client ${clientId}`, err);
            conversations = { channels: [], ims: [] };
          }
        }

        const key = `report_sent-${log.targetUuid}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { ...log, recipients: [] });
        }

        const grouped = groupedMap.get(key);
        const recipient =
          log.metadata?.phoneNumber ||
          log.metadata?.email ||
          this.resolveSlackConversationName(log.metadata?.slackConversationId, conversations) ||
          'Unknown';

        grouped.recipients.push(recipient);
        grouped.createdAt = log.createdAt;
      } else {
        this.groupedLogs.push(log);
      }
    }

    this.groupedLogs.push(...Array.from(groupedMap.values()));
    this.groupedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setTimeout(() => {
      this.groupedLogs?.forEach(log => this.markAsSeen(log));
    }, 2000);
  }

  isNew(log: any): boolean {
    return !this.seenLogIds.has(log.uuid);
  }

  markAsSeen(log: any): void {
    if (!this.seenLogIds.has(log.uuid)) {
      this.seenLogIds.add(log.uuid);
      localStorage.setItem('seenLogs', JSON.stringify(Array.from(this.seenLogIds)));
    }
  }

  resolveSlackConversationName(id: string, conversations: Conversations): string {
    const match =
      conversations.channels.find(c => c.id === id) ||
      conversations.ims.find(im => im.id === id);
    return match?.name || id;
  }
}
