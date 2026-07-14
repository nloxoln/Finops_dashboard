import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { CostSummaryCard } from '../components/cards/CostSummaryCard';
import { ResourceCard } from '../components/cards/ResourceCard';
import { CostTrendChart } from '../components/charts/CostTrendChart';
import { PeriodSelector } from '../components/common/PeriodSelector';
import { fetchCostSummary, fetchCostTrend, fetchResources } from '../services/api';
import type { CostSummary, CostTrendData, Resource, Period } from '../types';

const resourceColors = ['#FF6B9D', '#4A90E2', '#50E3C2', '#F5A623', '#5B4FFF', '#9B59B6'];

export const DashboardPage: React.FC = () => {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [costTrend, setCostTrend] = useState<CostTrendData[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const [summary, trend, resourcesData] = await Promise.all([
        fetchCostSummary(),
        fetchCostTrend(),
        fetchResources(),
      ]);
      setCostSummary(summary);

      // 기간에 따라 데이터 필터링
      const filteredTrend = filterDataByPeriod(trend, selectedPeriod);
      setCostTrend(filteredTrend);

      setResources(resourcesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDataByPeriod = (data: CostTrendData[], period: Period): CostTrendData[] => {
    const now = new Date('2026-07-09'); // 현재 날짜 기준
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
            {resources.map((resource, index) => (
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
