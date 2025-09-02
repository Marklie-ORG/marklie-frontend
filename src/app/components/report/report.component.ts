import { ChangeDetectorRef, Component, computed, effect, inject, input, Input, model, signal, SimpleChanges } from '@angular/core';
import { SchedulesService } from 'src/app/services/api/schedules.service';
import { GetAvailableMetricsResponse } from 'src/app/interfaces/interfaces.js';
import { AdAccount, ReportSection } from 'src/app/interfaces/report-sections.interfaces';

export interface MetricSelections {
  kpis: Record<string, boolean>;
  graphs: Record<string, boolean>;
  ads: Record<string, boolean>;
  campaigns: Record<string, boolean>;
}
 
@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

  reportSections = model<ReportSection[]>([]);
  @Input() reportTitle: string = 'Report Title';
  @Input() selectedDatePresetText: string = '';

  clientImageUrl = model<string>('');
  agencyImageUrl = model<string>('');

  clientImageGsUri = model<string>('');
  agencyImageGsUri = model<string>('');

  isViewMode = input<boolean>(false);

  schedulesService = inject(SchedulesService);

  availableMetrics: GetAvailableMetricsResponse = [];

  orderedSections = computed(() => {
    const sections = this.reportSections();
    return [...sections].sort((a, b) => a.order - b.order);
  });

  kpisSection = computed(() => {
    const sections = this.reportSections();
    return sections.find(section => section.key === 'kpis') || {} as ReportSection;
  });

  graphsSectionAdAccounts: AdAccount[] = [];

  graphsSection = computed(() => {
    const sections = this.reportSections();
    return sections.find(section => section.key === 'graphs') || {} as ReportSection;
  });

  adsSection = computed(() => {
    const sections = this.reportSections();
    return sections.find(section => section.key === 'ads') || {} as ReportSection;
  });

  campaignsSection = computed(() => {
    const sections = this.reportSections();
    return sections.find(section => section.key === 'campaigns') || {} as ReportSection;
  });

  cdr = inject(ChangeDetectorRef);

  constructor() {

    effect(() => {

      // console.log("Report sections changed:", this.reportSections());

      this.checkIfAllAdAccountsDisabled();
      
      this.graphsSectionAdAccounts = [...this.reportSections().find(section => section.key === 'graphs')?.adAccounts || []];
      
    });
  }

  checkIfAllAdAccountsDisabled() {
    for (let section of this.reportSections()) {
      let allAdAccounts = section.adAccounts;
      if (allAdAccounts.length > 0 && allAdAccounts.every(adAccount => !adAccount.enabled)) {
        section.enabled = false;
      }
    }
  }

  onKpiAdAccountsChange(updatedAdAccounts: AdAccount[]) {
    const updatedSections = this.reportSections().map(section => {
      if (section.key !== 'kpis') return section;
      return { ...section, adAccounts: [...updatedAdAccounts] } as ReportSection;
    });
    this.reportSections.set(updatedSections);
  }

  onGraphsAdAccountsChange(updatedAdAccounts: AdAccount[]) {
    const updatedSections = this.reportSections().map(section => {
      if (section.key !== 'graphs') return section;
      return { ...section, adAccounts: [...updatedAdAccounts] } as ReportSection;
    });
    this.reportSections.set(updatedSections);
  }

  onAdsAdAccountsChange(updatedAdAccounts: AdAccount[]) {
    const updatedSections = this.reportSections().map(section => {
      if (section.key !== 'ads') return section;
      return { ...section, adAccounts: [...updatedAdAccounts] } as ReportSection;
    });
    this.reportSections.set(updatedSections);
  }

  ngOnChanges(changes: SimpleChanges) {
  }

}
