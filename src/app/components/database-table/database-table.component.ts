import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface DatabaseReportItem {
  uuid: string;
  reportName: string;
  createdAt: string | Date;
}

@Component({
  selector: 'database-table',
  templateUrl: './database-table.component.html',
  styleUrls: ['./database-table.component.scss']
})
export class DatabaseTableComponent implements OnInit, OnChanges {
  @Input() reports: DatabaseReportItem[] = [];
  private router = inject(Router);

  reportsToRender: DatabaseReportItem[] = [];

  ngOnInit(): void {
    this.updateRenderList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reports']) {
      this.updateRenderList();
    }
  }

  private updateRenderList(): void {
    this.reportsToRender = Array.isArray(this.reports) ? [...this.reports] : [];
    // Sort newest first and limit to 4
    this.reportsToRender = this.reportsToRender
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
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