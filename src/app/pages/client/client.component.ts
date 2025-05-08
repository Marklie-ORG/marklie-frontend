import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SlackLoginService } from 'src/app/services/slack-login.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClientSettingsComponent } from '../../components/client-settings/client-settings.component';
import { Client, ClientService } from 'src/app/services/api/client.service.js';
import { ReportService } from 'src/app/services/api/report.service.js';
import { AuthService } from 'src/app/services/api/auth.service.js';

interface ActivityLogEntry {
  action: string;
  reportName: string;
  timestamp: string;
  reportId: string;
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
  scheduleOptions: ScheduledReport[] = [];

  activityLog: ActivityLogEntry[] = [
    {
      action: 'Report Generated',
      reportName: 'Daily Performance Summary',
      timestamp: this.formatDate(new Date(Date.now() - 3600000)), // 1 hour ago
      reportId: '1'
    },
    {
      action: 'Report Shared',
      reportName: 'Weekly Marketing Analytics',
      timestamp: this.formatDate(new Date(Date.now() - 7200000)), // 2 hours ago
      reportId: '2'
    },
    {
      action: 'Report Scheduled',
      reportName: 'Monthly Revenue Report',
      timestamp: this.formatDate(new Date(Date.now() - 86400000)), // 1 day ago
      reportId: '3'
    },
    {
      action: 'Report Deactivated',
      reportName: 'Campaign Summary Report',
      timestamp: this.formatDate(new Date(Date.now() - 172800000)), // 2 days ago
      reportId: '4'
    },
    {
      action: 'Report Generated',
      reportName: 'Quarterly Business Review',
      timestamp: this.formatDate(new Date(Date.now() - 259200000)), // 3 days ago
      reportId: '5'
    },
    {
      action: 'Report Edited',
      reportName: 'Social Media Analytics',
      timestamp: this.formatDate(new Date(Date.now() - 345600000)), // 4 days ago
      reportId: '6'
    },
    {
      action: 'Report Activated',
      reportName: 'Customer Engagement Report',
      timestamp: this.formatDate(new Date(Date.now() - 432000000)), // 5 days ago
      reportId: '7'
    }
  ];

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
    });
  }

  onEditReport(reportId: string) {
    this.router.navigate(['/report-example']);
  }

  goToMockReport(): void {
    this.router.navigate(['/reports', this.clientUuid]);
  }

  onViewReport(reportId: string) {
    // TODO: Implement navigation to report details
    console.log(`Viewing report with ID: ${reportId}`);
  }

  private async loadClientDetails() {
    if (!this.clientUuid) return;
    this.client = await this.clientService.getClient(this.clientUuid);
    console.log(this.client);
    this.scheduleOptions = this.client.crons || [];
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
