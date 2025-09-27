import { Metric } from "./report-sections.interfaces";

export type SectionKey = 'kpis' | 'graphs' | 'ads' | 'campaigns';

export type GetAvailableMetricsResponse  = GetAvailableMetricsAdAccount[]

export interface GetAvailableMetricsAdAccount {
  adAccountId: string;
  adAccountName: string;
  adAccountMetrics: {
    kpis: string[];
    graphs: string[];
    ads: string[];
    campaigns: string[];
    customMetrics: { id: string; name: string }[];
  }
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

export interface ScheduleReportRequest {

  frequency: string
  reportName: string
  time: string
  dayOfWeek: string
  dayOfMonth: number
  intervalDays: number
  cronExpression: string
  reviewRequired: boolean
  timeZone: string

  clientUuid: string
  organizationUuid: string
  datePreset: FACEBOOK_DATE_PRESETS

  messages: Messages
  images: Images
  colors: Colors

  providers: Provider[]

}

export interface Provider {
  provider: 'facebook' | 'tiktok' | 'google';
  sections: SectionScheduleReportRequest[];
}

export interface SectionScheduleReportRequest {
  name: SectionKey;
  order: number;
  enabled: boolean;
  adAccounts: AdAccountScheduleReportRequest[];
}

export interface AdAccountScheduleReportRequest {
  adAccountId: string;
  adAccountName: string;
  order: number;
  enabled: boolean;
  metrics: MetricScheduleReportRequest[];
  customMetrics: CustomMetricScheduleReportRequest[];
  currency: string;
  adsSettings?: {
    numberOfAds: number;
    sortAdsBy: string
  }
}

export interface MetricScheduleReportRequest {
  name: string;
  order: number;
}

export interface CustomMetricScheduleReportRequest {
  name: string;
  order: number;
  id: string;
}

export interface Messages {
  whatsapp: string,
  slack: string,
  email: {
    title: string,
    body: string,
  }
}

export interface Colors {
  headerBackgroundColor: string;
  reportBackgroundColor: string;
}

export interface Images {
  clientLogo: string,
  organizationLogo: string
}

export type Frequency = 'cron' | 'biweekly' | 'monthly' | 'custom' | 'weekly';

export enum FACEBOOK_DATE_PRESETS {
  TODAY = "today",
  YESTERDAY = "yesterday",
  THIS_MONTH = "this_month",
  LAST_MONTH = "last_month",
  THIS_QUARTER = "this_quarter",
  LAST_QUARTER = "last_quarter",
  THIS_YEAR = "this_year",
  LAST_YEAR = "last_year",
  LAST_3D = "last_3d",
  LAST_7D = "last_7d",
  LAST_14D = "last_14d",
  LAST_28D = "last_28d",
  LAST_30D = "last_30d",
  LAST_90D = "last_90d",
  MAXIMUM = "maximum"
}

export interface Metrics {
  [key: string]: {
    metrics: Metric[],
    order: number
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
  reportName: string
  images?: {
    clientLogo: string
    organizationLogo: string
    clientLogoGsUri: string
    organizationLogoGsUri: string
  }
  messages?: Messages
  colors?: Colors
  loomLink?: string
}

export interface ReportImages {
  clientLogo: string
  organizationLogo: string
}

export interface SendAfterReviewRequest {
  reportUuid: string;
  sendAt?: string;
}

export interface SendAfterReviewResponse {
  message: string;
  uuid?: string;
}

export interface UpdateReportMetadataRequest {
  // datePreset?: string
  // reviewNeeded?: boolean
  reportName?: string
  images?: {
    // clientLogo: string
    // organizationLogo: string
    clientLogoGsUri: string
    organizationLogoGsUri: string
  }
  messages?: Messages
  colors?: Colors
  loomLink?: string
}
