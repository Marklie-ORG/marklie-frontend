import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ClientService, Conversations } from '../../services/api/client.service.js';
import {Router} from "@angular/router";

@Component({
  selector: 'app-activity-log-item',
  templateUrl: './activity-logs-card.component.html',
  styleUrls: ['./activity-logs-card.component.scss']
})
export class LogsCardComponent implements OnInit, OnChanges {
  @Input() logs: any[] = [];
  @Input() level?: string;
  private router = inject(Router)

  seenLogIds = new Set<string>();
  groupedLogs: any[] = [];
  logsPerPage = 15;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.groupedLogs.length / this.logsPerPage);
  }

  get paginatedLogs(): any[] {
    const start = (this.currentPage - 1) * this.logsPerPage;
    return this.groupedLogs.slice(start, start + this.logsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

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

        const hasSlackConversationId = !!log.metadata?.slackConversationId;

        let conversations: Conversations = {channels: [], ims: []};

        const key = `report_sent-${log.targetUuid}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {...log, recipients: []});
        }

        const grouped = groupedMap.get(key);
        const recipient =
          log.metadata?.phoneNumber ||
          log.metadata?.email ||
          (hasSlackConversationId ? 'Slack' : this.resolveSlackConversationName(log.metadata?.slackConversationId, conversations)) ||
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

  formatTimeOrDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (isToday) return `${time} Today`;
    if (isYesterday) return `${time} Yesterday`;

    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `${time} ${datePart}`;
  }

  navigateToLog(log: any) {
    const route = this.getRoute(log);
    if (route) {
      this.router.navigate(route);
    }
  }

  getRoute(log: any): any[] | null {
    switch (log.action) {
      case 'report_sent':
      case 'report_generated':
        return ['/view-report', log.targetUuid];
      case 'created_schedule':
      case 'updated_schedule':
      case 'paused_schedule':
        return ['/edit-report', log.targetUuid];
      case 'client_added':
        return ['/client', log.clientUuid];
      default:
        return null;
    }
  }
}
