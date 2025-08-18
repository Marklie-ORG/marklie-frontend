import { Metadata, SectionKey } from "./interfaces"

export interface GetReportResponse {
    uuid: string
    createdAt: string
    updatedAt: string
    organization: string
    client: string
    reportType: string
    gcsUrl: string
    data: ReportData
    metadata: Metadata
    images?: {
      clientLogo: string
      organizationLogo: string
    }
    schedulingOption: string
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
  }

  export interface AdAccountReportResponse {
    adAccountId: string
    adAccountName: string
    data: AdAccountData
    order: number
  }

  export type AdAccountData = KpiAdAccountData | GraphsAdAccountData | AdsAdAccountData | TableAdAccountData

  // kpis
  export type KpiAdAccountData = KpiAdAccountMetric[]

  export interface KpiAdAccountMetric {
    name: string
    order: number
    value: number
  }

  // graphs
  export type GraphsAdAccountData = GraphData[]

  export interface GraphData {
    data: GraphDataPoint[]
    date_start: string
    date_end: string
  }

  export interface GraphDataPoint {
    name: string
    order: number
    value: number
  }

  // ads
  export type AdsAdAccountData = AdsAdAccountDataCreative[]

  export interface AdsAdAccountDataCreative {
    adId: string
    data: AdsAdAccountDataPoint[]
    ad_name: string
    sourceUrl: string
    adCreativeId: string
  }

  export interface AdsAdAccountDataPoint {
    name: string
    order: number
    value: number
  }

  // campaigns
  export type TableAdAccountData = CampaignData[]

  export interface CampaignData {
    campaign_name: string
    index: number
    data: CampaignDataPoint[]
  }

  export interface CampaignDataPoint {
    name: string
    order: number
    value: number
  }

  



  // export interface GraphDataPoint {
  //   date: string
  //   value: number
  // }

  // export interface MetricReportResponse {
  //   name: string
  //   order: number
  //   value: number
  // }