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
  activityLog: ScheduledReport[] = [];

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

  goToMockReport(): void {
    this.router.navigate(['/reports', this.clientUuid]);
  }

  private async loadClientDetails() {
    if (!this.clientUuid) return;
    this.client = await this.clientService.getClient(this.clientUuid);
    console.log(this.client);
    this.scheduleOptions = this.client.crons || [];
  }
}
