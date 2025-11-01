import { SectionKey } from "./interfaces";

export enum TemplateOrigin {
  SYSTEM = 'system',
  USER = 'user',
}

export enum TemplateVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export enum Frequency {
  weekly = 'weekly',
  biweekly = 'biweekly',
  monthly = 'monthly',
  custom = 'custom',
  cron = 'cron',
}

export interface ProviderMetric {
  name: string;
  displayName: string;
  category: string;
  type: string;
  selected?: boolean;
  order: number;
}

export interface ProviderAdAccount {
  adAccountId: string;
  adAccountName: string;
  metrics: ProviderMetric[];
  adsSettings?: any;
  campaignsSettings?: any;
  order: number;    
  enabled: boolean;
  currency: string;
}

export interface ProviderSection {
  name: SectionKey;
  displayName: string;
  adAccounts: ProviderAdAccount[];
  order: number;
}

export interface ProviderConfig {
  provider: string;
  sections: ProviderSection[];
}

export interface TemplateReviewDefaults {
  required: boolean;
}

export interface TemplateScheduleBlueprint {
  timezone: string;
  datePreset: string;
  time?: string;
  dayOfWeek?: DayOfWeek;
  dayOfMonth?: number;
  intervalDays?: number;
  cronExpression?: string;
  frequency: Frequency;
}

export interface TemplateCustomizationDefaults {
  colors?: {
    headerBg?: string;
    reportBg?: string;
  };
  logos?: {
    client?: {
      url?: string;
      gcsUri?: string;
    };
    org?: {
      url?: string;
      gcsUri?: string;
    };
  };
  title?: string;
}

export interface TemplateMessagingDefaults {
  email?: {
    title?: string;
    body?: string;
  };
  slack?: string;
  whatsapp?: string;
  pdfFilename?: string;
}

export interface SchedulingTemplate {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description?: string;
  origin: TemplateOrigin;
  visibility: TemplateVisibility;
  createdByUserUuid?: string;
  locked: boolean;
  providers?: ProviderConfig[];
  review: TemplateReviewDefaults;
  schedule: TemplateScheduleBlueprint;
  customization?: TemplateCustomizationDefaults;
  messaging?: TemplateMessagingDefaults;
  version: number;
  isActive: boolean;
}
