import { AdsAdAccountDataCreative, CampaignData } from "./get-report.interfaces";
import { SectionKey } from "./interfaces";

export interface ReportSection {
    key: SectionKey;
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
    campaignsData?: CampaignData[]
    creativesData?: AdsAdAccountDataCreative[]
  }
  
  export interface Metric {
    name: string
    order: number
    enabled?: boolean
    isCustom?: boolean
    id?: string
    value?: number
    currency?: string
    symbol?: string
    dataPoints?: MetricDataPoint[]
  }

  export interface MetricDataPoint {
    value: number
    date: string
  }