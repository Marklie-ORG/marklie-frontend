import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, ClientService, Workspace } from '../../services/api/client.service';
import { ReportService, Report } from 'src/app/services/api/report.service';
import { SlackLoginService } from 'src/app/services/slack-login.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Conversations } from 'src/app/services/api/client.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClientSettingsComponent } from '../../components/client-settings/client-settings.component';

interface ActivityLogEntry {
  action: string;
  reportName: string;
  timestamp: string;
  reportId: string;
}

interface ScheduledReport {
  uuid: string;
  name: string;
  client: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextSendingDate: Date;
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
  clientId: string | null = null;
  clientName: string = '';
  clientEmail: string = '';
  clientStatus: string = 'active';
  client: Client | null = null;

  

  reports: ScheduledReport[] = [
    {
      uuid: '1',
      name: 'Daily Performance Summary',
      frequency: 'daily',
      nextSendingDate: new Date(Date.now() + 86400000), // Tomorrow
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: this.clientId || ''
    },
    {
      uuid: '2',
      name: 'Weekly Marketing Analytics',
      frequency: 'weekly',
      nextSendingDate: new Date(Date.now() + 604800000), // Next week
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: this.clientId || ''
    },
    {
      uuid: '3',
      name: 'Monthly Revenue Report',
      frequency: 'monthly',
      nextSendingDate: new Date(Date.now() + 2592000000), // Next month
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: this.clientId || ''
    },
    {
      uuid: '4',
      name: 'Quarterly Business Review',
      frequency: 'quarterly',
      nextSendingDate: new Date(Date.now() + 7776000000), // Next quarter
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: this.clientId || ''
    }
  ];

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
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Get client ID from route parameters
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      this.loadClientDetails();
    });
  }

  private async loadClientDetails() {
    if (!this.clientId) {
      return;
    }
    this.client = await this.clientService.getClient(this.clientId);
    // this.onEditClient();
  }

  private async loadClientReports() {
    if (!this.clientId) {
      return;
    }
    const apiReports = await this.reportService.getClientReports(this.clientId);
    // Convert API reports to ScheduledReport format
    this.reports = apiReports.map(report => ({
      ...report,
      frequency: 'monthly' as const,
      nextSendingDate: new Date(Date.now() + 2592000000),
      isActive: true,
      client: this.clientId || ''
    }));
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

  onViewReports() {
    // TODO: Implement view reports functionality
    console.log('View reports clicked');
  }

  onEditReport(reportId: string) {
    this.router.navigate(['/report-example']);
  }

  onAddReport() {
    // this.router.navigate(['/client', this.clientId, 'report', '0']);
    this.router.navigate(['/report-example']);
  }

  onViewReport(reportId: string) {
    // TODO: Implement navigation to report details
    console.log(`Viewing report with ID: ${reportId}`);
  }

  toggleReportStatus(report: ScheduledReport) {
    report.isActive = !report.isActive;
    // TODO: Implement API call to update report status
    console.log(`Toggled report ${report.uuid} status to ${report.isActive}`);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  
}
