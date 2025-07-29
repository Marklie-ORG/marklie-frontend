import { Component, OnInit, inject, HostListener, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { faPause, faPlay, faTrashCan } from '@fortawesome/free-solid-svg-icons';

import { ClientService, Client } from 'src/app/services/api/client.service.js';
import { SchedulesService } from 'src/app/services/api/schedules.service.js';
import { ClientSettingsComponent } from '../../components/client-settings/client-settings.component';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

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
  selected?: boolean;
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit {
  private clientService = inject(ClientService);
  private schedulesService = inject(SchedulesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  clientUuid: string | null = null;
  client: Client | null = null;
  logs: any[] = [];

  scheduleOptions: ScheduledReport[] = [];
  selectedReports: ScheduledReport[] = [];

  allSelected = false;
  scheduleOptionsLoading = true;
  menuOpenId: string | null = null;

  readonly faPause = faPause;
  readonly faPlay = faPlay;
  readonly faTrashCan = faTrashCan;

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.clientUuid = params['id'];
      await this.loadClientDetails();
    });
  }

  private async loadClientDetails(): Promise<void> {
    if (!this.clientUuid) return;

    this.client = await this.clientService.getClient(this.clientUuid);
    this.logs = await this.clientService.getClientsLogs(this.clientUuid);
    this.scheduleOptions = await this.schedulesService.getSchedulingOptions(this.clientUuid);
    this.scheduleOptionsLoading = false;
    this.updateSelection();
  }

  formatTimeOrDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = d.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

    if (isToday) return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today`;
    if (isYesterday) return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Yesterday`;

    return d.toLocaleDateString();
  }

  onEditReport(uuid: string): void {
    this.router.navigate(['/edit-report', uuid]);
  }

  scheduleReport(): void {
    this.router.navigate(['/schedule-report', this.clientUuid]);
  }

  onEditClient(): void {
    const dialogRef = this.dialog.open(ClientSettingsComponent, {
      width: '800px',
      data: { client: this.client },
    });

    dialogRef.afterClosed().subscribe(() => this.loadClientDetails());
  }

  async onDelete(report: ScheduledReport): Promise<void> {
    await this.schedulesService.bulkDeleteSchedules([report.uuid]);
    this.closeDropdown();
    await this.loadClientDetails();
  }

  async onPause(report: ScheduledReport): Promise<void> {
    await this.schedulesService.bulkPauseSchedules([report.uuid]);
    this.closeDropdown();
    await this.loadClientDetails();
  }

  async onActivate(report: ScheduledReport): Promise<void> {
    await this.schedulesService.bulkActivateSchedule([report.uuid]);
    this.closeDropdown();
    await this.loadClientDetails();
  }

  async pauseSelected(): Promise<void> {
    await this.performBulkAction('pause');
  }

  async activateSelected(): Promise<void> {
    await this.performBulkAction('activate');
  }

  async deleteSelected(): Promise<void> {
    await this.performBulkAction('delete');
  }

  private async performBulkAction(action: 'pause' | 'activate' | 'delete'): Promise<void> {
    const selected = this.selectedReports;

    switch (action) {
      case 'pause':
        await this.schedulesService.bulkPauseSchedules(selected.filter(r => r.isActive).map(r => r.uuid));
        break;
      case 'activate':
        await this.schedulesService.bulkActivateSchedule(selected.filter(r => !r.isActive).map(r => r.uuid));
        break;
      case 'delete':
        await this.schedulesService.bulkDeleteSchedules(selected.map(r => r.uuid));
        break;
    }

    await this.loadClientDetails();
    this.selectedReports = [];
    this.allSelected = false;
  }

  updateSelection(): void {
    this.selectedReports = this.scheduleOptions.filter(r => r.selected);
    this.allSelected = this.scheduleOptions.length > 0 && this.selectedReports.length === this.scheduleOptions.length;
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.scheduleOptions.forEach(opt => (opt.selected = checked));
    this.updateSelection();
  }

  toggleMenu(uuid: string): void {
    this.menuOpenId = this.menuOpenId === uuid ? null : uuid;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.menuOpenId = null;
  }

  getLogMessage(log: any): string {
    switch (log.action) {
      case 'report_sent': return `Report has been sent to `;
      case 'report_generated': return `Report has been generated`;
      case 'created_schedule': return `Schedule created`;
      case 'updated_schedule': return `Schedule updated`;
      case 'paused_schedule': return `Schedule paused`;
      case 'added_collaborator': return `Collaborator added`;
      case 'client_added': return `Client ${log.client?.name || 'unknown'} successfully added! 🎉`;
      default: return log.message || 'Activity logged';
    }
  }
}
