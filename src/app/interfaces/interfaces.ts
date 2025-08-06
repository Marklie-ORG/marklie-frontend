export type MetricSectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

export interface ReportSection {
  key: MetricSectionKey;
  title: string;
  enabled: boolean;
  adAccounts: AdAccount[];
  order: number;
}

export interface AdAccount {
  id: string
  order: number
  enabled: boolean
  name: string
  metrics: Metric[]
}

export interface Metric {
    name: string
    order: number
    enabled?: boolean
    isCustom?: boolean
    id?: string
}

export interface GetAvailableMetricsResponse {
    [key: string]: AvailableMetricsAdAccount
  }

export interface AvailableMetricsAdAccount {
  ads: string[]
  campaigns: string[]
  graphs: string[]
  kpis: string[]
  customMetrics: AvailableMetricsAdAccountCustomMetric[]
}

export interface AvailableMetricsAdAccountCustomMetric {
  name: string
  id: string
}
  
  export interface Report {
    uuid:	string
    cronExpression:	string
    isActive: boolean,
    nextRun:	Date
    dataPreset:	string
    reviewNeeded:	boolean
  }
  
  export interface CreateScheduleRequest extends Schedule {
    metrics: Metrics
    datePreset: string
    clientUuid: string
    reportName: string
    timeZone: string
    messages: {
      whatsapp: string,
      slack: string,
      email: {
        title: string,
        body: string,
      }
    };
    images: {
      clientLogo: string,
      organizationLogo: string
    }
  }
  
  export interface Schedule {
    frequency: string
    reportName: string
    time: string
    dayOfWeek: string
    dayOfMonth: number
    intervalDays: number
    cronExpression: string
    reviewNeeded: boolean
  }
  
  
  
  export interface Metrics {
    [key: string]: {
      metrics: Metric[],
      order: number
    }
  }
  
  export interface GetReportResponse {
    uuid: string
    createdAt: string
    updatedAt: string
    organization: string
    client: string
    reportType: string
    gcsUrl: string
    data: Daum[]
    metadata: Metadata
    images?: {
      clientLogo: string
      organizationLogo: string
    }
  }
  
  export interface Daum {
    ads: Ad[]
    KPIs: Kpis
    graphs: Graph[]
    campaigns: Campaign[]
    adAccountId: string
  }
  
  export interface Ad {
    adId: string
    adCreativeId: string
    thumbnailUrl: string
    spend: string
    addToCart: string
    purchases: string
    roas: string
    sourceUrl: string
  }
  export interface Kpis {
    spend: string
    purchaseRoas: string
    conversionValue: string
    purchases: string
    impressions: string
    clicks: string
    cpc: string
    ctr: string
    costPerPurchase: number
    addToCart: string
    costPerAddToCart: number
    initiatedCheckouts: string
  }
  
  export interface Graph {
    spend: string
    impressions: number
    clicks: number
    ctr: string
    cpc: string
    purchaseRoas: string
    conversionValue: string
    engagement: number
    purchases: number
    costPerPurchase: string
    costPerCart: string
    addToCart: number
    initiatedCheckouts: number
    conversionRate: string
    date_start: string
    date_stop: string
  }
  
  
  export interface Campaign {
    index: number
    campaign_name: string
    spend: string
    purchases: number
    conversionRate: string
    purchaseRoas: string
  }
  
  export interface Metadata {
    datePreset: string
    reviewNeeded: boolean
    metricsSelections: any
    reportName: string
    images?: {
      clientLogo: string
      organizationLogo: string
    }
  }
  
  export interface ReportImages {
    clientLogo: string
    organizationLogo: string
  }