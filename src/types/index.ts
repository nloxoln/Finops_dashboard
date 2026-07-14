export interface Payer {
  id: string;
  name: string;
  accountId: string;
}

export interface CostSummary {
  lastMonth: number;
  avgCost: number;
  thisMonth: number;
}

export interface CostTrendData {
  date: string;
  cost: number;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  costTrend: CostTrendData[];
}

export interface Anomaly {
  id: string;
  date: string;
  title: string;
  resourceType: string;
  rawData: string;
  summary: string;
  cause: string;
  actionRequired: boolean;
}

export interface Report {
  id: string;
  title: string;
  createdAt: string;
  pdfUrl: string;
}

export interface SlackNotification {
  company: string;
  rawData: string;
  summary: string;
  cause: string;
  actionRequired: boolean;
}

export type Period = '1d' | '1w' | '1m' | '3m' | '1y';
