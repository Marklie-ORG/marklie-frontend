import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-viewer',
  templateUrl: './kpi-viewer.component.html',
})
export class KpiViewerComponent {
  @Input() metrics: string[] = [];
  @Input() KPIs: any = {};

  getKPIValue(metric: string): string | number {
    const value = this.KPIs?.[metric];
    return typeof value === 'number' ? value.toLocaleString() : value || '—';
  }

  formatLabel(metric: string): string {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
}
