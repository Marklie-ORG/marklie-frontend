import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, ClientService } from '../../services/api/client.service';
import { ReportService, Report } from 'src/app/services/api/report.service';

interface ActivityLogEntry {
  action: string;
  reportName: string;
  timestamp: string;
  reportId: string;
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  clientId: string | null = null;
  clientName: string = '';
  clientEmail: string = '';
  clientStatus: string = 'active';
  client: Client | null = null;
  reports: Report[] = [];

  activityLog: ActivityLogEntry[] = [
    {
      action: 'Sent',
      reportName: 'Monthly Performance Report',
      timestamp: '09:00, March 15, 2025',
      reportId: '1'
    },
    {
      action: 'Sent',
      reportName: 'Weekly Analytics Report',
      timestamp: '09:00, March 15, 2025',
      reportId: '2'
    },
    {
      action: 'Sent',
      reportName: 'Campaign Summary Report',
      timestamp: '09:00, March 15, 2025',
      reportId: '3'
    }
  ];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private clientService: ClientService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    // Get client ID from route parameters
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      // TODO: Fetch client details using the ID
      this.loadClientDetails();
      this.loadClientReports();
    });
  }

  private async loadClientDetails() {
    if (!this.clientId) {
      return;
    }
    this.client = await this.clientService.getClient(this.clientId);
  }

  private async loadClientReports() {
    if (!this.clientId) {
      return;
    }
    this.reports = await this.reportService.getClientReports(this.clientId);
  }

  onEditClient() {
    // TODO: Implement edit client functionality
    console.log('Edit client clicked');
  }

  onViewReports() {
    // TODO: Implement view reports functionality
    console.log('View reports clicked');
  }

  onEditReport(reportId: string) {
    this.router.navigate(['/client', this.clientId, 'report', reportId]);
  }

  onAddReport() {
    this.router.navigate(['/client', this.clientId, 'report', '0']);
  }

  onViewReport(reportId: string) {
    // TODO: Implement navigation to report details
    console.log(`Viewing report with ID: ${reportId}`);
  }
}
