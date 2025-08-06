export interface FeatureRow {
  feature: string;
  marklie: boolean;
  lookerStudio: boolean;
  others: boolean;
}

export const featuresTableData: FeatureRow[] = [
  {
    feature: "Automated data import",
    marklie: true,
    lookerStudio: false,
    others: true
  },
  {
    feature: "Data visualization",
    marklie: true,
    lookerStudio: true,
    others: true
  },
  {
    feature: "Full white label",
    marklie: true,
    lookerStudio: true,
    others: false
  },
  {
    feature: "Fully automated reporting",
    marklie: true,
    lookerStudio: false,
    others: false
  },
  {
    feature: "AI-powered summaries",
    marklie: true,
    lookerStudio: false,
    others: false
  },
  {
    feature: "Direct report delivery",
    marklie: true,
    lookerStudio: false,
    others: false
  },
  {
    feature: "Optimized for Meta/TikTok",
    marklie: true,
    lookerStudio: false,
    others: false
  }
];
