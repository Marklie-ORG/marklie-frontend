import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OnboardingService } from '../../services/api/onboarding.service';
import { Client, ClientService } from '../../services/api/client.service';
import { MatDialog } from '@angular/material/dialog';
import { AddClientComponent } from 'src/app/components/add-client/add-client.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isFbLoggedIn = true;
  clients: Client[] = [];

  constructor(
    private router: Router,
    private onboardingService: OnboardingService,
    private clientService: ClientService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    const onboardingSteps = await this.onboardingService.getOnboardingSteps();

    this.getClients();

    if (!onboardingSteps.organizationCreated) {
      this.router.navigate(['/onboarding']);
    }
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
    const newClient: Client = {
      name: clientData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: '1',
      uuid: '1'
    };
    this.clients.push(newClient);
  }

  fbLogin() {
    const appId = '1187569946099353';
    const redirectUri = 'https://derevian.co/saas/fb-login-callback';
    const scope = 'ads_management,ads_read,business_management,catalog_management,commerce_account_manage_orders,commerce_account_read_orders,commerce_account_read_reports,commerce_account_read_settings,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_events,instagram_manage_insights,instagram_manage_messages,instagram_shopping_tag_products,leads_retrieval,manage_fundraisers,page_events,pages_manage_ads,pages_show_list,pages_manage_cta,pages_manage_engagement,pages_manage_instant_articles,pages_manage_metadata,pages_manage_posts,pages_messaging,pages_read_engagement,pages_read_user_content,publish_video,read_insights,read_page_mailboxes,whatsapp_business_manage_events,whatsapp_business_management,whatsapp_business_messaging';

    const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
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
