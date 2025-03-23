import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextSendingDate: string;
  isActive: boolean;
}

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

  scheduledReports: ScheduledReport[] = [
    {
      id: '1',
      name: 'Monthly Performance Report',
      frequency: 'Monthly',
      nextSendingDate: '09:00, March 15, 2025',
      isActive: true
    },
    {
      id: '2',
      name: 'Weekly Analytics Report',
      frequency: 'Weekly',
      nextSendingDate: '09:00, March 15, 2025',
      isActive: true
    },
    {
      id: '3',
      name: 'Campaign Summary Report',
      frequency: 'Biweekly',
      nextSendingDate: '09:00, March 15, 2025',
      isActive: true
    }
  ];

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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Get client ID from route parameters
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      // TODO: Fetch client details using the ID
      this.loadClientDetails();
    });
  }

  private loadClientDetails() {
    // TODO: Implement API call to fetch client details
    // For now, using mock data
    this.clientName = 'Example Client';
    this.clientEmail = 'client@example.com';
  }

  onEditClient() {
    // TODO: Implement edit client functionality
    console.log('Edit client clicked');
  }

  onGenerateReport() {
    // TODO: Implement report generation
    console.log('Generate report clicked');
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

  toggleReportStatus(report: ScheduledReport) {
    report.isActive = !report.isActive;
    // TODO: Implement API call to update report status
    console.log(`Report ${report.name} status changed to ${report.isActive ? 'active' : 'inactive'}`);
  }

  onViewReport(reportId: string) {
    // TODO: Implement navigation to report details
    console.log(`Viewing report with ID: ${reportId}`);
  }
}
