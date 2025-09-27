export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    tier: 'free' | 'professional' | 'enterprise';
    price: number;
    interval: 'monthly' | 'yearly';
    limits: { clients: { min: number; max: number }; teamMembers: { min: number; max: number } };
    dataRefreshHours: number;
    features: {
      customization: boolean; metaIntegration: boolean; tiktokIntegration: boolean;
      publishedLinks: boolean; loomIntegration: boolean; aiDescription: boolean; marklyBadge: boolean;
    };
  }
  
export interface InvoiceRow { id: string; name: string; date: string; plan: string; amount: string; canDownload?: boolean; }
  
  export interface SubscriptionResponse {
    hasActiveSubscription: boolean;
    subscription: SubscriptionDetails | null;
  }
  export interface SubscriptionDetails {
    id: string;
    status: string;
    plan: { id: string; name: string; tier: string; price: number; interval: string };
    currentPeriodStart: string | Date | null;
    currentPeriodEnd: number | string | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | Date | null;
    usage: { reportsGenerated: number; reportsLimit: number };
  }