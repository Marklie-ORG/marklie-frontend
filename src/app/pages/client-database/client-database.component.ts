import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../services/api/report.service';
import { ReportsDatabaseRow } from '../../components/reports-database-list/reports-database-list.component';

@Component({
  selector: 'app-client-database',
  templateUrl: './client-database.component.html',
  styleUrl: './client-database.component.scss'
})
export class ClientDatabaseComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);

  clientUuid: string | null = null;
  clientName: string | null = null;

  rows: ReportsDatabaseRow[] = [];
  searchQuery: string = '';
  selectedClients: string[] = [];
  pageSize = 12;

  ngOnInit() {
    this.clientUuid = this.route.snapshot.params['clientUuid'];
    this.loadReports();
  }

  private async loadReports() {
    if (!this.clientUuid) return;
    const reports: any[] = await this.reportService.getClientReports(this.clientUuid);
    this.rows = (reports || []).map((r: any) => {
      const name = r?.client?.name || r?.client || '—';
      return {
        uuid: r.uuid,
        reportName: r?.metadata?.reportName || r?.reportType || 'Report',
        clientName: name,
        createdAt: r.createdAt,
        review: {
          required: r.review.required,
          reviewedAt: r.review.reviewedAt
        }
      } as ReportsDatabaseRow;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Preselect current client filter if client name is known
    const uniqueNames = Array.from(new Set(this.rows.map(r => r.clientName).filter(Boolean)));
    this.clientName = uniqueNames.length === 1 ? uniqueNames[0] : null;
    if (this.clientName) {
      this.selectedClients = [this.clientName];
    }
  }

  onSearchChange(value: string): void {
    this.searchQuery = value ?? '';
  }

  onSelectedClientsChange(clients: string[]): void {
    this.selectedClients = clients || [];
  }

  openReport(uuid: string): void {
    this.router.navigate(['/view-report', uuid]);
  }

  reviewReport(uuid: string): void {
    this.router.navigate(['/review-report', uuid]);
  }
  
}
