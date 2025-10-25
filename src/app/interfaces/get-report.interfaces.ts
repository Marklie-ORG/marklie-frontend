import { SchedulingOption } from "../pages/edit-report/edit-report.component"
import { Metadata, SectionKey } from "./interfaces"

export interface GetReportResponse {
  uuid: string;
  createdAt: string;
  updatedAt: string;

  organization: {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    name: string;
  };

  client: {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    organization: string;
    deletedAt: string | null;
  };

  schedulingOption: string; // FK UUID

  review: {
    reviewedAt: string | null;
    loomUrl: string;
  };

  storage: {
    pdfGcsUri: string;
  };

  schedule: {
    timezone: string;
    lastRun: string | null;
    nextRun: string | null;
    jobId: string | null;
    datePreset: string;
  };

  customization: {
    colors: {
      headerBackgroundColor: string;
      reportBackgroundColor: string;
    };
    logos: {
      org: {
        url: string;
        gcsUri: string;
      };
      client: {
        url: string;
        gcsUri: string;
      };
    };
    title: string;
  };

  messaging: {
    email: {
      body: string;
      title: string;
    };
    slack: string;
    whatsapp: string;
    pdfFilename: string;
  };

  data: ProviderReportResponse[]

  extras: {
    aiGeneratedContent: string;
    userReportDescription: string;
  };
  }

  export type ReportData = ProviderReportResponse[]

  export interface ProviderReportResponse {
    provider: string
    sections: SectionReportResponse[]
  }

  export interface SectionReportResponse {
    name: SectionKey
    order: number
    adAccounts: AdAccountReportResponse[]
    enabled?: boolean
  }

  export interface AdAccountReportResponse {
    adAccountId: string
    adAccountName: string
    data: AdAccountData
    order: number
    enabled?: boolean
    currency: string
  }

  export type AdAccountData = KpiAdAccountData | GraphsAdAccountData | AdsAdAccountData | TableAdAccountData

  // kpis
  export type KpiAdAccountData = KpiAdAccountMetric[]

  export interface KpiAdAccountMetric {
    name: string
    order: number
    value: number
    enabled?: boolean
  }

  // graphs
  export type GraphsAdAccountData = GraphData[]

  export interface GraphData {
    metrics: GraphDataPoint[]
    date_start: string
    date_end: string
  }

  export interface GraphDataPoint {
    name: string
    order: number
    value: number
    enabled?: boolean
  }

  // ads
  export type AdsAdAccountData = AdsAdAccountDataCreative[]

  export interface AdsAdAccountDataCreative {
    adId: string
    metrics: AdsAdAccountDataPoint[]
    adName: string
    sourceUrl: string
    adCreativeId: string
    thumbnailUrl?: string
  }

  export interface AdsAdAccountDataPoint {
    name: string
    order: number
    value: number
    enabled?: boolean
    symbol?: string
    currency?: string
  }

  // campaigns
  export type TableAdAccountData = CampaignData[]

  export interface CampaignData {
    campaignName: string
    metrics: CampaignDataPoint[]
    index: number
  }

  export interface CampaignDataPoint {
    name: string
    order: number
    value: number
    enabled?: boolean
    symbol?: string
    currency?: string
  }
