import { Component, OnInit, inject } from '@angular/core';
import { ReportService } from '../../services/api/report.service.js';
import { ActivatedRoute, Router } from '@angular/router';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

interface DatabaseRow {
  uuid: string;
  reportName: string;
  clientName: string;
  createdAt: string | Date;
  review: {
    required: boolean;
    reviewedAt: string | Date;
  }
}

@Component({
  selector: 'app-reports-database-page',
  templateUrl: './reports-database-page.component.html',
  styleUrls: ['./reports-database-page.component.scss']
})
export class ReportsDatabasePageComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  rows: DatabaseRow[] = [];
  searchQuery: string = '';
  loading = true;
  pageSize = 12;
  currentPage = 1;
  selectedClients: string[] = [];

  async ngOnInit() {
    // Initialize from query params (supports repeated ?client=A&client=B or comma-separated)
    const initialClients = this.route.snapshot.queryParamMap.getAll('client');
    const single = this.route.snapshot.queryParamMap.get('client');
    const parsedSingle = single && initialClients.length === 0 ? single.split(',').map(s => s.trim()).filter(Boolean) : [];
    this.selectedClients = Array.from(new Set([...(initialClients || []), ...parsedSingle]));

    // Keep state in sync if URL changes externally
    this.route.queryParamMap.subscribe(map => {
      const all = map.getAll('client');
      const one = map.get('client');
      const parsed = all.length > 0 ? all : (one ? one.split(',').map(s => s.trim()).filter(Boolean) : []);
      const normalized = Array.from(new Set(parsed));
      const changed = normalized.length !== this.selectedClients.length || normalized.some(c => !this.selectedClients.includes(c));
      if (changed) {
        this.selectedClients = normalized;
        this.currentPage = 1;
      }
    });

    const reports: any[] = await this.reportService.getReports();
    this.rows = (reports || []).map((r: any) => ({
      uuid: r.uuid,
      reportName: r?.metadata?.reportName || r?.reportType || 'Report',
      clientName: r?.client?.name || r?.client || '—',
      createdAt: r.createdAt,
      review: {
        required: r.review.required,
        reviewedAt: r.review.reviewedAt
      }
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.loading = false;
  }

  get filteredRows(): DatabaseRow[] {
    const query = this.searchQuery.trim().toLowerCase();
    let rows = this.rows;
    if (query) {
      rows = rows.filter(r =>
        r.reportName?.toLowerCase().includes(query) ||
        r.clientName?.toLowerCase().includes(query)
      );
    }
    if (this.selectedClients.length > 0) {
      const set = new Set(this.selectedClients);
      rows = rows.filter(r => set.has(r.clientName));
    }
    return rows;
  }

  get totalItems(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get paginatedRows(): DatabaseRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get pageStart(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  onSearchChange(value: string): void {
    this.searchQuery = value ?? '';
    this.currentPage = 1;
  }

  onSelectedClientsChange(clients: string[]): void {
    this.selectedClients = clients || [];
    this.currentPage = 1;
    this.updateClientQueryParam(this.selectedClients);
  }

  goToPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages);
    this.currentPage = clamped;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  formatTimeOrDate(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (isToday) return `${time} Today`;
    if (isYesterday) return `${time} Yesterday`;

    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `${time} ${datePart}`;
  }

  openReport(uuid: string): void {
    this.router.navigate(['/view-report', uuid]);
  }

  reviewReport(uuid: string): void {
    this.router.navigate(['/review-report', uuid]);
  }

  protected readonly faFilter = faFilter;

  isClientSelected(client: string): boolean {
    return this.selectedClients.includes(client);
  }

  private updateClientQueryParam(clients: string[]): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { client: clients.length > 0 ? clients : null },
      queryParamsHandling: 'merge'
    });
  }

  // No host click handling needed; handled inside the reusable component
} 