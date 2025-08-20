import {Component, OnInit, OnDestroy, Inject, inject} from '@angular/core';
import { HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SlackLoginService } from 'src/app/services/slack-login.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClientSettingsComponent } from '../../components/client-settings/client-settings.component';
import { Client, ClientService } from 'src/app/services/api/client.service.js';
import { ReportService } from 'src/app/services/api/report.service.js';
import { AuthService } from 'src/app/services/api/auth.service.js';
import {SchedulesService} from "../../services/api/schedules.service.js";
import { DatabaseReportItem } from '../../components/database-table/database-table.component';
import { faEllipsisVertical, faPause, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from '@services/notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog.component';

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
  activityLogs: any[] = [];
  scheduleOptions: ScheduledReport[] = [];
  generatedReports: { uuid: string; reportName: string; createdAt: Date | string; }[] = [];

  scheduleOptionsLoading = true;
  private schedulesService = inject(SchedulesService);

  faEllipsisVertical = faEllipsisVertical;
  faPlay = faPlay;
  faPause = faPause;
  faTrash = faTrash;

  openActionsForUuid: string | null = null;

  private notificationService = inject(NotificationService);

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
    this.router.navigate(['/edit-report', this.clientUuid, reportId]);
  }

  scheduleReport(): void {
    this.router.navigate(['/schedule-report', this.clientUuid]);
  }

  onViewReport(reportId: string) {
    // TODO: Implement navigation to report details
    console.log(`Viewing report with ID: ${reportId}`);
  }

  toggleActionsMenu(scheduleOption: ScheduledReport, event?: Event) {
    this.openActionsForUuid = this.openActionsForUuid === scheduleOption.uuid ? null : scheduleOption.uuid;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close actions menu when clicking outside
    this.openActionsForUuid = null;
  }

  async activateSchedule(uuid: string) {
    try {
      await this.reportService.activateSchedulingOptions([uuid]);
      this.scheduleOptions = this.scheduleOptions.map(s => s.uuid === uuid ? { ...s, isActive: true } : s);
      this.notificationService.info('Report activated');
    } finally {
      this.openActionsForUuid = null;
    }
  }

  async pauseSchedule(uuid: string) {
    try {
      await this.reportService.stopSchedulingOptions([uuid]);
      this.scheduleOptions = this.scheduleOptions.map(s => s.uuid === uuid ? { ...s, isActive: false } : s);
      this.notificationService.info('Report paused');
    } finally {
      this.openActionsForUuid = null;
    }
  }

  deleteSchedule(uuid: string) {
    this.openActionsForUuid = null;
    const data: ConfirmDialogData = {
      title: 'Delete scheduled report',
      message: 'Are you sure you want to delete this scheduled report?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data
    });
    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      try {
        await this.reportService.deleteSchedulingOptions([uuid]);
        this.scheduleOptions = this.scheduleOptions.filter(s => s.uuid !== uuid);
        this.notificationService.info('Report deleted');
      } catch (e) {
        console.error('Failed to delete schedule', e);
      }
    });
  }

  private async loadClientDetails() {
    if (!this.clientUuid) return;
    this.client = await this.clientService.getClient(this.clientUuid);
    this.activityLogs = await this.clientService.getClientsLogs(this.clientUuid);
    this.scheduleOptions = await this.schedulesService.getSchedulingOptions(this.clientUuid)
    this.scheduleOptionsLoading = false;

    const reports: any[] = await this.reportService.getClientReports(this.clientUuid);
    this.generatedReports = (reports || []).map((r: any): DatabaseReportItem => ({
      uuid: r.uuid,
      reportName: r?.schedulingOption?.reportName || r?.reportType || 'Report',
      createdAt: r.createdAt
    }));
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
