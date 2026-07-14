import type { Payer, CostSummary, CostTrendData, Resource, Anomaly, Report } from '../types';
import payersData from '../mockData/payers.json';
import costSummaryData from '../mockData/costSummary.json';
import costTrendData from '../mockData/costTrend.json';
import resourcesData from '../mockData/resources.json';
import anomaliesData from '../mockData/anomalies.json';
import reportsData from '../mockData/reports.json';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPayers = async (): Promise<Payer[]> => {
  await delay(300);
  return payersData as Payer[];
};

export const fetchCostSummary = async (): Promise<CostSummary> => {
  await delay(300);
  return costSummaryData as CostSummary;
};

export const fetchCostTrend = async (): Promise<CostTrendData[]> => {
  await delay(300);
  return costTrendData as CostTrendData[];
};

export const fetchResources = async (): Promise<Resource[]> => {
  await delay(300);
  return resourcesData as Resource[];
};

export const fetchResourceById = async (id: string): Promise<Resource | undefined> => {
  await delay(300);
  return (resourcesData as Resource[]).find(r => r.id === id);
};

export const fetchAnomalies = async (): Promise<Anomaly[]> => {
  await delay(300);
  return anomaliesData as Anomaly[];
};

export const fetchAnomaliesByResource = async (resourceType: string): Promise<Anomaly[]> => {
  await delay(300);
  return (anomaliesData as Anomaly[]).filter(a => a.resourceType === resourceType);
};

export const fetchReports = async (): Promise<Report[]> => {
  await delay(300);
  return reportsData as Report[];
};

export const fetchReportById = async (id: string): Promise<Report | undefined> => {
  await delay(300);
  return (reportsData as Report[]).find(r => r.id === id);
};
