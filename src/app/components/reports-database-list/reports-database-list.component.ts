import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { ShareClientDatabaseComponent } from '../share-client-database/share-client-database.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@services/api/auth.service';

export interface ReportsDatabaseRow {
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
  selector: 'app-reports-database-list',
  templateUrl: './reports-database-list.component.html',
  styleUrls: ['./reports-database-list.component.scss']
})
export class ReportsDatabaseListComponent implements OnInit, OnChanges {
  @Input() rows: ReportsDatabaseRow[] = [];
  @Input() searchQuery: string = '';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Input() selectedClients: string[] = [];
  @Output() selectedClientsChange = new EventEmitter<string[]>();
  @Input() pageSize: number = 12;
  @Input() clientUsageMode: boolean = false;
  @Input() columnWidths?: { time: string; client: string; report: string; action: string };
  @Input() clientUuid: string = '';

  @Output() open = new EventEmitter<string>();
  @Output() review = new EventEmitter<string>();

  isFilterOpen = false;
  uniqueClients: string[] = [];
  currentPage = 1;
  @ViewChild('filterMenu') filterMenu?: ElementRef<HTMLElement>;
  @ViewChild('filterTrigger') filterTrigger?: ElementRef<HTMLElement>;

  accessedByClient: boolean = false;

  private dialog = inject(MatDialog)
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.computeUniqueClients();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.computeUniqueClients();
    }
    const decodedToken = this.authService.getDecodedAccessTokenInfo();
    this.accessedByClient = decodedToken.isClientAccessToken;
  }

  private computeUniqueClients(): void {
    this.uniqueClients = Array.from(new Set((this.rows || []).map(r => r.clientName).filter(Boolean))).sort();
  }

  readonly widthPresets: { default: { time: string; client: string; report: string; action: string }; clientUsage: { time: string; client: string; report: string; action: string } } = {
    default: { time: '20%', client: '30%', report: '30%', action: '20%' },
    clientUsage: { time: '40%', client: '0%', report: '40%', action: '20%' }
  };

  get effectiveWidths(): { time: string; client: string; report: string; action: string } {
    if (this.columnWidths) return this.columnWidths;
    return this.clientUsageMode ? this.widthPresets.clientUsage : this.widthPresets.default;
  }

  get filteredRows(): ReportsDatabaseRow[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    let list = this.rows || [];
    if (q) {
      list = list.filter(r =>
        r.reportName?.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q)
      );
    }
    if ((this.selectedClients || []).length > 0) {
      const set = new Set(this.selectedClients);
      list = list.filter(r => set.has(r.clientName));
    }
    return list;
  }

  get totalItems(): number { return this.filteredRows.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }
  get pageStart(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  get paginatedRows(): ReportsDatabaseRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  onSearchChange(value: string): void {
    this.searchQueryChange.emit(value ?? '');
    this.currentPage = 1;
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  isClientSelected(client: string): boolean {
    return (this.selectedClients || []).includes(client);
  }

  onToggleClient(client: string, checked: boolean): void {
    const set = new Set(this.selectedClients || []);
    if (checked) set.add(client); else set.delete(client);
    this.selectedClientsChange.emit(Array.from(set));
    this.currentPage = 1;
  }

  clearClientFilter(): void {
    this.selectedClientsChange.emit([]);
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages);
    this.currentPage = clamped;
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  formatTimeOrDate(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (isToday) return `${time} Today`;
    if (isYesterday) return `${time} Yesterday`;
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${time} ${datePart}`;
  }

  onOpen(uuid: string): void { this.open.emit(uuid); }
  onReview(uuid: string): void { this.review.emit(uuid); }

  protected readonly faFilter = faFilter;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isFilterOpen) return;
    const target = event.target as Node;
    const insideTrigger = this.filterTrigger?.nativeElement.contains(target);
    const insideMenu = this.filterMenu?.nativeElement.contains(target);
    if (!insideTrigger && !insideMenu) {
      this.isFilterOpen = false;
    }
  }

  openShareModal() {
    this.dialog.open(ShareClientDatabaseComponent, {
      data: {
        clientUuid: this.clientUuid
      }
    })
  }

}


