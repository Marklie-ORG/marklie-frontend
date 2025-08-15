import { Component, OnInit, inject } from '@angular/core';
import { ReportService } from '../../services/api/report.service.js';
import { Router } from '@angular/router';

interface DatabaseRow {
  uuid: string;
  reportName: string;
  clientName: string;
  createdAt: string | Date;
}

@Component({
  selector: 'app-reports-database-page',
  templateUrl: './reports-database-page.component.html',
  styleUrls: ['./reports-database-page.component.scss']
})
export class ReportsDatabasePageComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);

  rows: DatabaseRow[] = [];
  searchQuery: string = '';
  loading = true;
  pageSize = 12;
  currentPage = 1;

  async ngOnInit() {
    const reports: any[] = await this.reportService.getReports();
    this.rows = (reports || []).map((r: any) => ({
      uuid: r.uuid,
      reportName: r?.metadata?.reportName || r?.reportType || 'Report',
      clientName: r?.client?.name || r?.client || '—',
      createdAt: r.createdAt
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.rows = [...this.rows, ...this.rows, ...this.rows, ...this.rows]
    this.loading = false;
  }

  get filteredRows(): DatabaseRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(r =>
      r.reportName?.toLowerCase().includes(q) ||
      r.clientName?.toLowerCase().includes(q)
    );
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
} 