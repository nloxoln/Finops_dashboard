import type { CostSummary, CostTrendData, Resource } from '../types';

const COST_API_ENDPOINT = import.meta.env.VITE_COST_API_ENDPOINT;

// 실제 Cost Explorer 데이터를 사용할 계정 ID (예: 올리브영 실습 계정)
export const REAL_ACCOUNT_ID = import.meta.env.VITE_REAL_ACCOUNT_ID as string | undefined;

export interface CostApiResponse {
  summary: CostSummary;
  trend: CostTrendData[];
  resources: Resource[];
}

/**
 * 특정 accountId 가 실제 데이터를 사용하는 계정인지 판별.
 * 엔드포인트와 실습 계정 ID 가 모두 설정되어 있어야 실제 API 를 사용.
 */
export const isRealAccount = (accountId?: string): boolean => {
  return Boolean(COST_API_ENDPOINT && REAL_ACCOUNT_ID && accountId === REAL_ACCOUNT_ID);
};

/**
 * Cost API (Lambda + API Gateway) 를 호출해 가공된 비용 데이터를 가져온다.
 */
export const fetchCostData = async (accountId?: string): Promise<CostApiResponse> => {
  if (!COST_API_ENDPOINT) {
    throw new Error('VITE_COST_API_ENDPOINT 가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  const url = new URL(COST_API_ENDPOINT);
  if (accountId) {
    url.searchParams.set('accountId', accountId);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Cost API error! status: ${response.status}`);
  }

  return (await response.json()) as CostApiResponse;
};
