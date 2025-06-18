import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { AddClientComponent } from 'src/app/components/add-client/add-client.component';
import { OnboardingService } from "../../services/api/onboarding.service.js";
import { ClientService } from "../../services/api/client.service.js";
import { FacebookLoginService } from "../../services/api/facebook-login.service.js";
import { Client } from 'src/app/services/api/client.service.js';
import { User, UserService } from 'src/app/services/api/user.service.js';
import {OrganizationService} from "../../services/api/organization.service.js";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isFacebookConnected: boolean | undefined = undefined;
  randomNumber = this.getRandomNumber(1, 3);
  groupedLogs: any[] = [];

  logs: any[] = [];

  clients: Client[] = [];

  constructor(
    private router: Router,
    private onboardingService: OnboardingService,
    private clientService: ClientService,
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private facebookLoginService: FacebookLoginService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    let user: User;

    try {
      user = await this.userService.me();
    } catch (error) {
      this.router.navigate(['/']);
      return;
    }

    if (!user.activeOrganization) {
      this.router.navigate(['/onboarding']);
    }

    await this.getClients();

    const onboardingSteps = await this.onboardingService.getOnboardingSteps();

    if (!onboardingSteps.facebookConnected) {
      this.isFacebookConnected = false;
      document.body.classList.add('no-scroll');
    } else {
      this.isFacebookConnected = true;
      document.body.classList.remove('no-scroll');
    }

    const logs = await this.organizationService.getLogs(user.activeOrganization)

    const groupedMap = new Map<string, any>();

    for (const log of logs) {
      if (log.action === 'report_sent' && log.targetUuid) {
        const key = `report_sent-${log.targetUuid}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { ...log, recipients: [] });
        }
        const grouped = groupedMap.get(key);
        grouped.recipients.push(
          log.metadata?.phoneNumber || log.metadata?.email || log.metadata?.slackConversationId ||'Unknown'
        );
        grouped.createdAt = log.createdAt;
      } else {
        this.logs.push(log);
      }
    }

    this.groupedLogs.push(...Array.from(groupedMap.values()));
    this.groupedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  ngOnDestroy() {
    document.body.classList.remove('no-scroll');
  }

  async getClients() {
    this.clients = await this.clientService.getClients();
  }

  showAddClientModal() {
    const dialogRef = this.dialog.open(AddClientComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getClients();
    });
  }

  addClient(clientData: { name: string; platforms: string[] }) {
    console.log(clientData);
  }

  connectFacebook() {
    this.facebookLoginService.connectFacebook();
  }

  viewReport(clientId: string) {
    this.router.navigate(['/client', clientId]);
    // this.router.navigate(['/report'], { queryParams: { clientId } });
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


  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
