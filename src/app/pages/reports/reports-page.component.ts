import { Component, OnInit } from '@angular/core';
import {
  faEnvelope,
  faPhone,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faMeta,
  faSlack,
} from '@fortawesome/free-brands-svg-icons';
import { OrganizationService } from '../../services/api/organization.service.js';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
})
export class ReportsPageComponent implements OnInit {
  schedules: any[] = [];
  filteredReports: any[] = [];
  pagedReports: any[] = [];

  currentPage = 1;
  reportsPerPage = 20;
  selectedReports = new Set<number>();

  searchTerm = '';
  filterActive = 'all';
  filterPlatforms = new Set<string>();
  filterVisible = false;

  availablePlatforms = ['facebook', 'instagram', 'linkedin'];

  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faSlack = faSlack;
  faMeta = faMeta;
  faFilter = faFilter;

  constructor(private organizationService: OrganizationService) {}

  async ngOnInit() {
    this.schedules = await this.organizationService.getSchedulingOptions();
    this.filteredReports = [...this.schedules];
    this.updatePagedReports();
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toggleReportSelection(index: number) {
    if (this.selectedReports.has(index)) {
      this.selectedReports.delete(index);
    } else {
      this.selectedReports.add(index);
    }
  }

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredReports = [...this.schedules];
    } else {
      this.filteredReports = this.schedules.filter(report =>
        report.reportName?.toLowerCase().includes(term) ||
        report.client.name.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePagedReports();
  }

  toggleFilter() {
    this.filterVisible = !this.filterVisible;
  }

  setActiveFilter(value: string) {
    this.filterActive = value;
    this.applyFilters();
  }

  togglePlatform(platform: string) {
    if (this.filterPlatforms.has(platform)) {
      this.filterPlatforms.delete(platform);
    } else {
      this.filterPlatforms.add(platform);
    }
    this.applyFilters();
  }

  formatRelativeDate(dateString: string | Date): string {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();

    const diffTime = now.getTime() - date.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // e.g. May 30
    }
  }

  applyFilters() {
    let filtered = this.schedules;

    if (this.filterActive !== 'all') {
      const isActive = this.filterActive === 'active';
      filtered = filtered.filter((r) => r.isActive === isActive);
    }

    if (this.filterPlatforms.size > 0) {
      filtered = filtered.filter((r) =>
        this.filterPlatforms.has(r.platform.toLowerCase())
      );
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.client.name.toLowerCase().includes(term) ||
          r.reportName.toLowerCase().includes(term)
      );
    }

    this.filteredReports = filtered;
    this.currentPage = 1;
    this.updatePagedReports();
  }

  updatePagedReports() {
    const start = (this.currentPage - 1) * this.reportsPerPage;
    const end = start + this.reportsPerPage;
    this.pagedReports = this.filteredReports.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > Math.ceil(this.filteredReports.length / this.reportsPerPage)) {
      return;
    }
    this.currentPage = page;
    this.updatePagedReports();
  }

  protected readonly Math = Math;
}
