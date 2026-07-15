import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { CostSummaryCard } from '../components/cards/CostSummaryCard';
import { ResourceCard } from '../components/cards/ResourceCard';
import { CostTrendChart } from '../components/charts/CostTrendChart';
import { PeriodSelector } from '../components/common/PeriodSelector';
import { fetchCostSummary } from '../services/api';
import { fetchCostData, isRealAccount } from '../services/costApi';
import { useAuth } from '../contexts/AuthContext';
import type { CostSummary, CostTrendData, Resource, Period } from '../types';

const resourceColors = ['#FF6B9D', '#4A90E2', '#50E3C2', '#F5A623', '#5B4FFF', '#9B59B6'];

export const DashboardPage: React.FC = () => {
  const { selectedPayer } = useAuth();
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [fullTrend, setFullTrend] = useState<CostTrendData[]>([]); // 필터 전 전체 추이(원본)
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1m');
  const [loading, setLoading] = useState(true);

  // 데이터 로딩은 "계정이 바뀔 때"만. 기간 변경은 아래 useMemo 로 클라이언트 필터만 함(재요청 X)
  useEffect(() => {
    loadData();
  }, [selectedPayer?.accountId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const accountId = selectedPayer?.accountId;

      if (isRealAccount(accountId)) {
        // 올리브영(실계정): 배포된 cost-api 를 한 번 호출해 요약/추이/리소스를 모두 받음
        const { summary, trend, resources } = await fetchCostData(accountId);
        setCostSummary(summary);
        setFullTrend(trend);
        setResources(resources);
      } else {
        // 실데이터 미연동 계정: 요약만 mock, 추이/리소스는 비움
        setCostSummary(await fetchCostSummary());
        setFullTrend([]);
        setResources([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDataByPeriod = (data: CostTrendData[], period: Period): CostTrendData[] => {
    // 데이터의 가장 최근 날짜를 기준으로 필터링 (mock/실데이터 모두 대응)
    const now =
      data.length > 0
        ? new Date(data.reduce((max, d) => (d.date > max ? d.date : max), data[0].date))
        : new Date();
    let daysToShow = 30;

    switch (period) {
      case '1d':
        daysToShow = 1;
        break;
      case '1w':
        daysToShow = 7;
        break;
      case '1m':
        daysToShow = 30;
        break;
      case '3m':
        daysToShow = 90;
        break;
      case '1y':
        daysToShow = 365;
        break;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate && itemDate <= now;
    });
  };

  // 기간 변경 시 재요청 없이 이미 받은 추이만 다시 필터 → 추이 그래프만 갱신됨
  const costTrend = useMemo(
    () => filterDataByPeriod(fullTrend, selectedPeriod),
    [fullTrend, selectedPeriod]
  );

  // 리소스 카드는 "최근 7일간 비용이 발생한 서비스"만 노출 (7일 내 0원이면 카드 미생성)
  const visibleResources = useMemo(() => {
    const allDates = resources.flatMap((r) => r.costTrend.map((p) => p.date));
    if (allDates.length === 0) return [];
    const refNow = new Date(allDates.reduce((max, d) => (d > max ? d : max)));
    const cutoff = new Date(refNow);
    cutoff.setDate(cutoff.getDate() - 7);
    return resources.filter((r) =>
      r.costTrend.some((p) => {
        const dt = new Date(p.date);
        return dt > cutoff && dt <= refNow && p.cost > 0;
      })
    );
  }, [resources]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-primary">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  // 현재 날짜 기준으로 이번달/저번달 계산
  const getCurrentMonthInfo = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    return {
      currentMonth: `${currentMonth}월`,
      lastMonth: `${lastMonth}월`,
      currentYear,
      lastMonthYear
    };
  };

  const monthInfo = getCurrentMonthInfo();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <div className="grid grid-cols-3 gap-6">
            <CostSummaryCard
              title="평균 발생비용"
              amount={costSummary?.avgCost || 0}
              bgColor="bg-green"
            />
            <CostSummaryCard
              title={`저번달 비용 (${monthInfo.lastMonth})`}
              amount={costSummary?.lastMonth || 0}
              bgColor="bg-blue"
            />
            <CostSummaryCard
              title={`이번달 비용 (${monthInfo.currentMonth})`}
              amount={costSummary?.thisMonth || 0}
              bgColor="bg-orange"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">계정의 비용 추이 그래프</h2>
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <CostTrendChart data={costTrend} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">리소스별 비용 추이 그래프</h2>
          <div className="grid grid-cols-3 gap-6">
            {visibleResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                color={resourceColors[index % resourceColors.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
