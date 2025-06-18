import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SlackLoginService } from 'src/app/services/slack-login.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClientSettingsComponent } from '../../components/client-settings/client-settings.component';
import { Client, ClientService } from 'src/app/services/api/client.service.js';
import { ReportService } from 'src/app/services/api/report.service.js';
import { AuthService } from 'src/app/services/api/auth.service.js';
import { faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';

interface Activity {
  status: 'new' | 'old',
  date: Date,
  clientName: string,
  activity: string
}

interface ScheduledReport {
  uuid: string;
  cronExpression: string;
  nextRun: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  clientUuid: string | null = null;
  client: Client | null = null;
  groupedLogs: any[] = [];
  scheduleOptions: ScheduledReport[] = [];

  scheduleOptionsLoading = true;

  faCircle = faCircle;
  faCircleDot = faCircleDot;

  activities: Activity[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private reportService: ReportService,
    private slackLoginService: SlackLoginService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}


  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.clientUuid = params['id'];
      await this.loadClientDetails();
      // this.onEditClient();
    });
  }

  onEditReport(reportId: string) {
    this.router.navigate(['/edit-report', reportId]);
  }

  scheduleReport(): void {
    this.router.navigate(['/schedule-report', this.clientUuid]);
  }

  onViewReport(reportId: string) {
    // TODO: Implement navigation to report details
    console.log(`Viewing report with ID: ${reportId}`);
  }

  private async loadClientDetails() {
    if (!this.clientUuid) return;
    this.client = await this.clientService.getClient(this.clientUuid);
    const logs = await this.clientService.getClientsLogs(this.clientUuid);
    this.filterLogs(logs)
    this.scheduleOptions = this.client.crons || [];
    this.scheduleOptionsLoading = false;
  }

  private filterLogs(logs: any[]){
    const groupedMap = new Map<string, any>();

    for (const log of logs) {
      if (log.action === 'report_sent' && log.targetUuid) {
        const key = `report_sent-${log.targetUuid}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { ...log, recipients: [] });
        }
        const grouped = groupedMap.get(key);
        grouped.recipients.push(
          log.metadata?.phoneNumber || log.metadata?.email || log.metadata?.slackConversationId || 'Unknown'
        );
        grouped.createdAt = log.createdAt;
      } else {
        this.groupedLogs.push(log);
      }
    }

    this.groupedLogs.push(...Array.from(groupedMap.values()));
    this.groupedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  }

  formatTimeOrDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Yesterday';
    }

    return d.toLocaleDateString();
  }

  getLogMessage(log: any): string {
    switch (log.action) {
      case 'report_sent':
        return `Report has been sent to `;
      case 'report_generated':
        return `Report has been generated`;
      case 'created_schedule':
        return `Schedule created`;
      case 'updated_schedule':
        return `Schedule updated`;
      case 'paused_schedule':
        return `Schedule paused`;
      case 'added_collaborator':
        return `Collaborator added`;
      case 'client_added':
        return `Client ${log.client?.name || 'unknown'} successfully added! 🎉`;
      default:
        return log.message || 'Activity logged';
    }
  }


  onEditClient() {
    const dialogRef = this.dialog.open(ClientSettingsComponent, {
      width: '800px',
      data: {
        client: this.client
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadClientDetails();
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
