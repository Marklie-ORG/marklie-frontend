import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, ClientService } from '../../services/api/client.service';
import { AuthService } from "../../services/api/auth.service.js";
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
  clientId: string | null = null;
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

  openScheduleModal(client: any, cron?: any) {
    this.currentClient = client;

    if (cron) {
      // Editing
      this.editingSchedule = true;
      this.currentScheduleId = cron.uuid;
      this.scheduleForm = {
        frequency: cron.frequency,
        time: cron.time,
        dataPreset: cron.dataPreset,
        reviewNeeded: cron.reviewNeeded,
        metrics: []
      };
    } else {
      // New schedule
      this.editingSchedule = false;
      this.currentScheduleId = null;
      this.scheduleForm = {
        frequency: 'daily',
        time: '09:00',
        dataPreset: 'last_7d',
        reviewNeeded: false,
        metrics: this.availableMetrics
      };
    }

    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
    this.currentClient = null;
  }

  async submitSchedule() {
    const scheduleData = {
      ...this.scheduleForm,
      clientUuid: this.currentClient.uuid
    };

    try {
      if (this.editingSchedule && this.currentScheduleId) {
        // Update
        const response = await this.authService.updateSchedule(this.currentScheduleId, scheduleData);
        const idx = this.scheduleOptions.findIndex(s => s.uuid === this.currentScheduleId);
        if (idx !== -1) this.scheduleOptions[idx] = response;
      } else {
        // Create
        const response = await this.authService.createSchedule(scheduleData);
        this.scheduleOptions.push(response);
      }
      this.closeScheduleModal();
    } catch (err) {
      console.error('Error saving schedule:', err);
    }
  }

  async deleteSchedule(scheduleId: string) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await this.authService.deleteSchedule(scheduleId);
        this.scheduleOptions = this.scheduleOptions.filter(s => s.uuid !== scheduleId);
      } catch (err) {
        console.error('Error deleting schedule:', err);
      }
    }
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.clientId = params['id'];
      await this.loadClientDetails();
    });
  }

  private async loadClientDetails() {
    if (!this.clientId) return;
    this.client = await this.clientService.getClient(this.clientId);
    this.scheduleOptions = this.client.crons || [];
  }

  protected readonly formatDate = formatDate;
}
