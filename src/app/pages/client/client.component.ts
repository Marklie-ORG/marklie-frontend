import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, ClientService } from '../../api/services/api/client.service';
import { AuthService } from "../../api/services/api/auth.service.js";
import {formatDate} from "@angular/common";

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
  availableMetrics = ['Revenue', 'Leads', 'Conversions', 'CTR', 'Impressions'];

  scheduleForm = {
    frequency: '',
    time: '',
    dataPreset: '',
    reviewNeeded: false,
    metrics: [] as string[],
  };

  showScheduleModal = false;
  editingSchedule = false;
  currentClient: any = null;
  currentScheduleId: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.clientUuid = params['id'];
      await this.loadClientDetails();
    });
  }

  goToMockReport(): void {
    this.router.navigate(['/reports', this.clientUuid]); // or another identifier
  }

  private async loadClientDetails() {
    if (!this.clientUuid) return;
    this.client = await this.clientService.getClient(this.clientUuid);
    this.scheduleOptions = this.client.crons || [];
  }

  protected readonly formatDate = formatDate;
}
