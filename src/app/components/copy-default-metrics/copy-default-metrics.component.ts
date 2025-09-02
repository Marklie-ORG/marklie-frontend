import { Component, OnInit, inject } from '@angular/core';
import { OrganizationService } from 'src/app/services/api/organization.service';
import { SectionKey } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-copy-default-metrics',
  templateUrl: './copy-default-metrics.component.html',
  styleUrl: './copy-default-metrics.component.scss'
})
export class CopyDefaultMetricsComponent implements OnInit {
  private organizationService = inject(OrganizationService);

  schedules: SchedulingOption[] = [];

  clients: { uuid: string; name: string }[] = [];
  selectedClientUuid: string = '';

  clientSchedules: SchedulingOption[] = [];
  selectedScheduleUuid: string = '';

  sections: Section[] = [];
  selectedSectionName: SectionKey | '' = '';

  adAccounts: Section['adAccounts'] = [];
  selectedAdAccountId: string = '';

  metrics: string[] = [];

  async ngOnInit() {
    await this.loadSchedulingOptions();
  }

  async loadSchedulingOptions() {
    this.schedules = (await this.organizationService.getSchedulingOptions()) as SchedulingOption[];

    const map = new Map<string, string>();
    for (const s of this.schedules) {
      if (s?.client?.uuid) map.set(s.client.uuid, s.client.name);
    }
    this.clients = Array.from(map.entries())
      .map(([uuid, name]) => ({ uuid, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  onClientChange() {
    this.clientSchedules = this.schedules.filter(s => s.client?.uuid === this.selectedClientUuid);
    this.selectedScheduleUuid = '';
    this.sections = [];
    this.selectedSectionName = '';
    this.adAccounts = [];
    this.selectedAdAccountId = '';
    this.metrics = [];
  }

  onScheduleChange() {
    const schedule = this.clientSchedules.find(s => s.uuid === this.selectedScheduleUuid);
    const facebookProvider = schedule?.jobData?.providers?.find((p: any) => p.provider === 'facebook');
    this.sections = (facebookProvider?.sections || []) as Section[];
    this.selectedSectionName = '';
    this.adAccounts = [];
    this.selectedAdAccountId = '';
    this.metrics = [];
  }

  onSectionChange() {
    const schedule = this.clientSchedules.find(s => s.uuid === this.selectedScheduleUuid);
    const facebookProvider = schedule?.jobData?.providers?.find((p: any) => p.provider === 'facebook');
    const section = (facebookProvider?.sections || []).find((sec: Section) => sec.name === this.selectedSectionName) as Section | undefined;

    this.adAccounts = [...(section?.adAccounts || [])].sort((a, b) => a.adAccountName.localeCompare(b.adAccountName));
    this.selectedAdAccountId = '';
    this.metrics = [];
  }

  onAdAccountChange() {
    const adAccount = this.adAccounts.find(a => a.adAccountId === this.selectedAdAccountId);
    const metricSet = new Set<string>();
    for (const m of adAccount?.metrics || []) {
      if (m?.name) metricSet.add(m.name);
    }
    for (const cm of adAccount?.customMetrics || []) {
      if (cm?.name) metricSet.add(cm.name);
    }
    this.metrics = Array.from(metricSet).sort((a, b) => a.localeCompare(b));
  }

  // Click handlers for list UI
  selectClient(client: { uuid: string; name: string }) {
    if (this.selectedClientUuid === client.uuid) return;
    this.selectedClientUuid = client.uuid;
    this.onClientChange();
  }

  selectSchedule(schedule: SchedulingOption) {
    if (this.selectedScheduleUuid === schedule.uuid) return;
    this.selectedScheduleUuid = schedule.uuid;
    this.onScheduleChange();
  }

  selectSection(section: Section) {
    if (this.selectedSectionName === section.name) return;
    this.selectedSectionName = section.name;
    this.onSectionChange();
  }

  selectAdAccount(account: Section['adAccounts'][number]) {
    if (this.selectedAdAccountId === account.adAccountId) return;
    this.selectedAdAccountId = account.adAccountId;
    this.onAdAccountChange();
  }

  formatSectionName(key: SectionKey): string {
    const names: Record<SectionKey, string> = {
      kpis: 'Main KPIs',
      graphs: 'Graphs',
      ads: 'Best creatives',
      campaigns: 'Best campaigns'
    };
    return names[key] ?? key;
  }
}

// Minimal shapes to keep this component self-contained
interface SchedulingOption {
  uuid: string;
  reportName: string;
  client: { uuid: string; name: string };
  jobData: {
    providers: Array<{ provider: string; sections: Section[] }>
  };
}

interface Section {
  name: SectionKey;
  order: number;
  enabled: boolean;
  adAccounts: Array<{
    adAccountId: string;
    adAccountName: string;
    metrics: Array<{ name: string; order: number }>;
    customMetrics: Array<{ id: string; name: string; order: number }>;
  }>;
}
