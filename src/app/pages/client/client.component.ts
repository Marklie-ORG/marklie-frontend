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
  scheduleOptions: ScheduledReport[] = [];

  faCircle = faCircle;
  faCircleDot = faCircleDot;

  activities: Activity[] = [
    // {
    //   status: 'new',
    //   date: new Date(),
    //   clientName: 'Acme Corp',
    //   activity: 'Report generated for Q1 2024'
    // },
    // {
    //   status: 'new',
    //   date: new Date(Date.now() - 86400000), // 1 day ago
    //   clientName: 'TechStart Inc',
    //   activity: 'New client added'
    // },
    // {
    //   status: 'old',
    //   date: new Date(Date.now() - 172800000), // 2 days ago
    //   clientName: 'Global Services',
    //   activity: 'Report sent via email'
    // },
    // {
    //   status: 'old',
    //   date: new Date(Date.now() - 259200000), // 3 days ago
    //   clientName: 'Innovation Labs',
    //   activity: 'Facebook account connected'
    // },
    // {
    //   status: 'old',
    //   date: new Date(Date.now() - 345600000), // 4 days ago
    //   clientName: 'Digital Solutions',
    //   activity: 'Report configuration updated'
    // }
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
    this.router.navigate(['/pdf-report/1bc6d6c9-96ed-4589-9dee-80dca6195e73']);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
