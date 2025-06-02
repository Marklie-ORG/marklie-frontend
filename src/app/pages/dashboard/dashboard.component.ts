import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { AddClientComponent } from 'src/app/components/add-client/add-client.component';
import { OnboardingService } from "../../services/api/onboarding.service.js";
import { ClientService } from "../../services/api/client.service.js";
import { FacebookLoginService } from "../../services/api/facebook-login.service.js";
import { Client } from 'src/app/services/api/client.service.js';
import { User, UserService } from 'src/app/services/api/user.service.js';
import { faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';

interface Activity {
  status: 'new' | 'old',
  date: Date,
  clientName: string,
  activity: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isFacebookConnected: boolean | undefined = undefined;
  randomNumber = this.getRandomNumber(1, 3);
  faCircle = faCircle;
  faCircleDot = faCircleDot;

  clients: Client[] = [];
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
    private router: Router,
    private onboardingService: OnboardingService,
    private clientService: ClientService,
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
    

    // if (!onboardingSteps.organizationCreated) {
    //   this.router.navigate(['/onboarding']);
    // }
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      // year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
}
