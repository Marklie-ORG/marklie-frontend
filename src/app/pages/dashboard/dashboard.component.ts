import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { AddClientComponent } from 'src/app/components/add-client/add-client.component';
import {OnboardingService} from "../../api/services/onboarding.service.js";
import {ClientService} from "../../api/services/client.service.js";
import {FacebookLoginService} from "../../api/services/facebook-login.service.js";

interface Activity {
  id: string;
  type: 'report_generated' | 'client_added' | 'report_shared' | 'platform_connected';
  clientName: string;
  timestamp: Date;
  details: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isFbLoggedIn = true;
  clients: Client[] = [];
  activities: Activity[] = [
    {
      id: '1',
      type: 'report_generated',
      clientName: 'Acme Corp',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      details: 'Monthly performance report generated'
    },
    {
      id: '2',
      type: 'client_added',
      clientName: 'TechStart Inc',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      details: 'New client added to the platform'
    },
    {
      id: '3',
      type: 'platform_connected',
      clientName: 'Global Solutions',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      details: 'Facebook and Instagram accounts connected'
    },
    {
      id: '4',
      type: 'report_shared',
      clientName: 'Acme Corp',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      details: 'Q1 Performance report shared with team'
    }
  ];

  constructor(
    private router: Router,
    private onboardingService: OnboardingService,
    private clientService: ClientService,
    private dialog: MatDialog,
    private facebookLoginService: FacebookLoginService,

  ) {}

  async ngOnInit() {
    const onboardingSteps = await this.onboardingService.getOnboardingSteps();

    await this.getClients();

    // if (!onboardingSteps.organizationCreated) {
    //   this.router.navigate(['/onboarding']);
    // }
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
