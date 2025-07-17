import {Component, OnInit, OnDestroy, Inject, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SlackLoginService } from 'src/app/services/slack-login.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClientSettingsComponent } from '../../components/client-settings/client-settings.component';
import { Client, ClientService } from 'src/app/services/api/client.service.js';
import { ReportService } from 'src/app/services/api/report.service.js';
import { AuthService } from 'src/app/services/api/auth.service.js';
import {SchedulesService} from "../../services/api/schedules.service.js";

interface Activity {
  status: 'new' | 'old',
  date: Date,
  clientName: string,
  activity: string
}

export interface ScheduledReport {
  uuid: string;
  cronExpression: string;
  frequency: string;
  reportName: string;
  nextRun: string;
  lastRun: string;
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
  logs: any[] = [];
  scheduleOptions: ScheduledReport[] = [];

  scheduleOptionsLoading = true;
  private schedulesService = inject(SchedulesService);

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
    this.logs = await this.clientService.getClientsLogs(this.clientUuid);
    this.scheduleOptions = await this.schedulesService.getSchedulingOptions(this.clientUuid)
    this.scheduleOptionsLoading = false;
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
