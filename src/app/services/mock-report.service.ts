import { Injectable } from '@angular/core';
import { MockData } from '../pages/schedule-report/schedule-report.component';

@Injectable({
  providedIn: 'root'
})
export class MockReportService {

  constructor() { }

  public generateMockData(): MockData {
    let mockData: MockData = {
      KPIs: {},
      ads: [],
      campaigns: [],
      graphs: []
    }
    mockData.KPIs = this.mockKPIs();
    mockData.ads = this.mockAds();
    mockData.campaigns = this.mockCampaigns();
    mockData.graphs = this.mockGraphData();

    return mockData;
  }


  private mockKPIs() {
    return {
      spend: 1234.56,
      impressions: 145000,
      clicks: 3123,
      cpc: 0.58,
      ctr: 2.3,
      actions: 9876,
      action_values: 11340,
      purchase_roas: 3.12,
      reach: 89000
    };
  }

  private mockAds() {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: `ad-${i + 1}`,
      name: `Ad Creative #${i + 1}`,
      thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
      spend: +(Math.random() * 500).toFixed(2),
      addToCart: Math.floor(Math.random() * 150),
      purchases: Math.floor(Math.random() * 80),
      roas: +(Math.random() * 5).toFixed(2),
      sourceUrl: `https://facebook.com/ads/${i + 1}`
    }));
  }

  private mockCampaigns() {
    return Array.from({ length: 5 }).map((_, i) => {
      const base = {
        campaign_id: `camp-${i + 1}`,
        campaign_name: `Campaign ${i + 1}`
      };

      const availableMetrics = [
        "campaign_id",
        "campaign_name",
        "spend",
        "impressions",
        "clicks",
        "ctr",
        "actions"
    ]

      const metrics = availableMetrics.reduce((acc, metric) => {
        const isCurrency = ['spend'].includes(metric.toLowerCase());
        const isPercent = metric.toLowerCase().includes('rate');
        const isRoas = metric.toLowerCase().includes('roas');
        const isInt = ['purchases', 'conversions'].includes(metric.toLowerCase());

        let value = isInt ? Math.floor(Math.random() * 200)
          : isPercent || isRoas ? +(Math.random() * 5).toFixed(2)
            : isCurrency ? +(Math.random() * 1500).toFixed(2)
              : +(Math.random() * 100).toFixed(2);

        acc[metric] = value;
        return acc;
      }, {} as Record<string, number>);

      return { ...base, ...metrics };
    });
  }

  private mockGraphData() {
    const today = new Date();
    return Array.from({ length: 10 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (10 - i));
      return {
        date_start: d.toISOString(),
        spend: (Math.random() * 300).toFixed(2),
        purchaseRoas: (Math.random() * 5).toFixed(2),
        conversionValue: (Math.random() * 2000).toFixed(2),
        purchases: Math.floor(Math.random() * 50),
        addToCart: Math.floor(Math.random() * 100),
        initiatedCheckouts: Math.floor(Math.random() * 80),
        clicks: Math.floor(Math.random() * 500),
        impressions: Math.floor(Math.random() * 5000),
        ctr: (Math.random() * 5).toFixed(2),
        cpc: (Math.random() * 2).toFixed(2),
        costPerPurchase: (Math.random() * 100).toFixed(2),
        costPerCart: (Math.random() * 20).toFixed(2)
      };
    });
  }

}
