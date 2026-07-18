import type { Payer, CostSummary, CostTrendData, Resource, Anomaly, Report } from '../types';
import payersData from '../mockData/payers.json';
import anomaliesData from '../mockData/anomalies.json';
import reportsData from '../mockData/reports.json';
// costSummaryData, costTrendData, resourcesData import 제거

const COST_API = import.meta.env.VITE_COST_API_ENDPOINT;

export const fetchResources = async (): Promise<Resource[]> => {
  const res = await fetch(`${COST_API}?days=30`);
  return res.json();
};

export const fetchResourceById = async (id: string): Promise<Resource | undefined> => {
  const resources = await fetchResources();
  return resources.find(r => r.id === id);
};

// 계정 전체 추이 = 리소스별 데이터를 날짜 기준으로 합산
export const fetchCostTrend = async (): Promise<CostTrendData[]> => {
  const resources = await fetchResources();
  const totals = new Map<string, number>();
  resources.forEach(r => r.costTrend.forEach(({ date, cost }) => {
    totals.set(date, (totals.get(date) || 0) + cost);
  }));
  return Array.from(totals.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const fetchCostSummary = async (): Promise<CostSummary> => {
  const costSummaryData = await import('../mockData/costSummary.json');
  return costSummaryData.default as CostSummary;
};

export const fetchPayers = async (): Promise<Payer[]> => payersData as Payer[];
export const fetchAnomalies = async (): Promise<Anomaly[]> => anomaliesData as Anomaly[];
export const fetchAnomaliesByResource = async (resourceType: string): Promise<Anomaly[]> =>
  (anomaliesData as Anomaly[]).filter(a => a.resourceType === resourceType);
export const fetchReports = async (): Promise<Report[]> => reportsData as Report[];
export const fetchReportById = async (id: string): Promise<Report | undefined> =>
  (reportsData as Report[]).find(r => r.id === id);
