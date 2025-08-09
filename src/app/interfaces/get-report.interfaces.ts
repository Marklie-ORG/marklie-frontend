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
    name: string
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
    metrics: MetricReportResponse[]
    order: number
  }

  export interface MetricReportResponse {
    name: string
    order: number
    value: number
  }