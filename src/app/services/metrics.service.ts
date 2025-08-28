import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor() { }

  formatMetricLabel(metric: string): string {
    if (!metric) return '';
    return metric
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase());
  }

  formatMetricValue(metric: string, value: any): string {
    if (value === undefined) value = 1000;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return value ?? '-';

    const rounded = num.toFixed(2);
    if (['spend', 'cpc'].includes(metric)) return `$${rounded}`;
    if (metric.includes('roas')) return `${rounded}x`;
    return Number(num).toLocaleString();
  }

  getFormattedMetricName(metricName: string): string {
    if (metricName === 'add_to_cart') return 'Add to cart';
    if (metricName === 'clicks') return 'Clicks';
    if (metricName === 'spend') return 'Spend';
    if (metricName === 'impressions') return 'Impressions';
    if (metricName === 'clicks') return 'Clicks';
    if (metricName === 'cpc') return 'Cost per click (CPC)';
    if (metricName === 'ctr') return 'Click-through rate (CTR)';
    if (metricName === 'cpm') return 'Cost per thousand impressions (CPM)';
    if (metricName === 'cpp') return 'Cost per thousand reach (CPP)';
    if (metricName === 'reach') return 'Reach';
    if (metricName === 'purchase_roas') return 'Purchase ROAS';
    if (metricName === 'conversion_value') return 'Conversion value';
    if (metricName === 'purchases') return 'Purchases';
    if (metricName === 'initiated_checkouts') return 'Initiated checkouts';
    if (metricName === 'engagement') return 'Engagement';
    if (metricName === 'leads') return 'Leads';
    if (metricName === 'cost_per_lead') return 'Cost per Lead';
    if (metricName === 'cost_per_purchase') return 'Cost per Purchase';
    if (metricName === 'cost_per_add_to_cart') return 'Cost per Add to Cart';
    if (metricName === 'conversion_rate') return 'Conversion rate';
    else return metricName;
  }
  
}
