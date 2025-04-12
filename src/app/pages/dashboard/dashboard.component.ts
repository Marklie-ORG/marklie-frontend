import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from '../../models/client.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isFbLoggedIn = true;
  showAddClientModal = false;
  clients: Client[] = [];
  selectedClient: Client | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Add some initial clients with activity text and logs
    this.clients = [
      {
        id: '1',
        name: 'Acme Corporation',
        platforms: ['Facebook', 'TikTok'],
        createdAt: new Date(),
        activity: 'Last campaign reached 1M users with 15% engagement rate. Recent posts performing above average with 25% increase in followers.',
        activityLog: [
          {
            id: '1',
            timestamp: new Date('2024-03-20T10:30:00'),
            action: 'Campaign Performance',
            details: 'Campaign "Summer Sale 2024" reached 1M users with 15% engagement rate'
          },
          {
            id: '2',
            timestamp: new Date('2024-03-19T15:45:00'),
            action: 'Follower Growth',
            details: '25% increase in followers across all platforms'
          }
        ]
      },
      {
        id: '2',
        name: 'TechStart Inc',
        platforms: ['Facebook'],
        createdAt: new Date(),
        activity: 'Facebook ads performing well with 2.5x ROI. Latest product launch campaign generated 500+ leads in the past week.',
        activityLog: [
          {
            id: '3',
            timestamp: new Date('2024-03-20T14:20:00'),
            action: 'ROI Update',
            details: 'Facebook ads campaign achieved 2.5x ROI'
          }
        ]
      },
      {
        id: '3',
        name: 'Global Brands',
        platforms: ['TikTok'],
        createdAt: new Date(),
        activity: 'Viral TikTok campaign achieved 500K views. Influencer collaboration resulted in 30% increase in brand mentions.',
        activityLog: [
          {
            id: '4',
            timestamp: new Date('2024-03-20T16:45:00'),
            action: 'Viral Campaign',
            details: 'TikTok campaign reached 500K views'
          }
        ]
      }
    ];
    
    // Set default selected client
    this.selectedClient = this.clients[0];
  }

  selectClient(client: Client) {
    this.selectedClient = client;
  }

  openAddClientModal() {
    this.showAddClientModal = true;
  }

  closeAddClientModal() {
    this.showAddClientModal = false;
  }

  addClient(clientData: { name: string; platforms: string[] }) {
    console.log(clientData);
    const newClient: Client = {
      id: (this.clients.length + 1).toString(),
      name: clientData.name,
      platforms: clientData.platforms,
      createdAt: new Date(),
      activity: 'New client added. No activity recorded yet.',
      activityLog: [{
        id: '1',
        timestamp: new Date(),
        action: 'Client Created',
        details: 'New client account was created'
      }]
    };
    this.clients.push(newClient);
    this.closeAddClientModal();
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
