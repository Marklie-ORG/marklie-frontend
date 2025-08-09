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
  }
  
  export interface Metric {
      name: string
      order: number
      enabled?: boolean
      isCustom?: boolean
      id?: string
  }