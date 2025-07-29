import {Component, inject, Inject, OnInit} from '@angular/core';
import {
  faEnvelope, faPhone, faFilter, faPause, faPlay, faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import { OrganizationService } from '../../services/api/organization.service';
import {SchedulesService} from "../../services/api/schedules.service.js";
import { faMeta, faSlack } from '@fortawesome/free-brands-svg-icons';

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
  selectedReports = new Set<string>();
  allSelected = false;

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

  private schedulesService = inject(SchedulesService)


  async ngOnInit() {
    await this.loadOptions()
    this.updatePagedReports();
  }

  async loadOptions() {
    this.schedules = await this.schedulesService.getSchedulingOptions("c5b300eb-ab4d-4db6-bae7-c81610dd9f5a");
    this.filteredReports = [...this.schedules];
  }

  capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  }

  toggleReportSelection(uuid: string) {
    this.selectedReports.has(uuid) ? this.selectedReports.delete(uuid) : this.selectedReports.add(uuid);
    this.allSelected = this.selectedReports.size === this.filteredReports.length;
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelected = checked;
    this.selectedReports = new Set(
      checked ? this.filteredReports.map(r => r.uuid) : []
    );
  }

  async refreshDate() {
    this.selectedReports.clear();
    await this.loadOptions();
    this.applyFilters();
    this.allSelected = false
  }

  async bulkPause() {
    const uuids = Array.from(this.selectedReports);
    await this.schedulesService.bulkPauseSchedules(uuids);
    await this.refreshDate()
  }

  async bulkActivate() {
    const uuids = Array.from(this.selectedReports);
    await this.schedulesService.bulkActivateSchedule(uuids);
    await this.refreshDate()
  }

  async bulkDelete() {
    const uuids = Array.from(this.selectedReports);
    await this.schedulesService.bulkDeleteSchedules(uuids);
    await this.refreshDate()
  }

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredReports = term
      ? this.schedules.filter(report =>
        report.reportName?.toLowerCase().includes(term) || report.client.name.toLowerCase().includes(term)
      )
      : [...this.schedules];

    this.currentPage = 1;
    this.updatePagedReports();
  }

  toggleFilter() {
    this.filterVisible = !this.filterVisible;
  }

  togglePlatform(platform: string) {
    this.filterPlatforms.has(platform)
      ? this.filterPlatforms.delete(platform)
      : this.filterPlatforms.add(platform);
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.schedules;

    if (this.filterActive !== 'all') {
      const isActive = this.filterActive === 'active';
      filtered = filtered.filter(r => r.isActive === isActive);
    }

    if (this.filterPlatforms.size > 0) {
      filtered = filtered.filter(r =>
        this.filterPlatforms.has(r.platform?.toLowerCase())
      );
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        r => r.client.name.toLowerCase().includes(term) || r.reportName.toLowerCase().includes(term)
      );
    }

    this.filteredReports = filtered;
    this.currentPage = 1;
    this.updatePagedReports();
  }

  formatRelativeDate(date: string | Date): string {
    if (!date) return '-';
    const d = new Date(date);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (isToday) return 'Today';

    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  updatePagedReports() {
    const start = (this.currentPage - 1) * this.reportsPerPage;
    const end = start + this.reportsPerPage;
    this.pagedReports = this.filteredReports.slice(start, end);
  }

  goToPage(page: number) {
    const totalPages = Math.ceil(this.filteredReports.length / this.reportsPerPage);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.updatePagedReports();
  }

  protected readonly Math = Math;
  protected readonly faPause = faPause;
  protected readonly faPlay = faPlay;
  protected readonly faTrashCan = faTrashCan;
}
