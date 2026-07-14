import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { CostTrendChart } from '../components/charts/CostTrendChart';
import { PeriodSelector } from '../components/common/PeriodSelector';
import { DatePicker } from '../components/common/DatePicker';
import { AnomalyTable } from '../components/tables/AnomalyTable';
import { useAuth } from '../contexts/AuthContext';
import { fetchResourceById, fetchAnomaliesByResource } from '../services/api';
import type { Resource, Anomaly, Period, CostTrendData } from '../types';

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { selectedPayer } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [allAnomalies, setAllAnomalies] = useState<Anomaly[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1m');
  const [startDate, setStartDate] = useState('2026-06-09');
  const [endDate, setEndDate] = useState('2026-07-09');
  const [filteredCostTrend, setFilteredCostTrend] = useState<CostTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      loadData();
    }
  }, [resourceId]);

  useEffect(() => {
    if (resource) {
      filterChartData();
    }
  }, [selectedPeriod, resource]);

  useEffect(() => {
    filterAnomaliesByDateRange();
  }, [startDate, endDate, allAnomalies]);

  const loadData = async () => {
    try {
      const [resourceData, anomaliesData] = await Promise.all([
        fetchResourceById(resourceId!),
        fetchAnomaliesByResource(resourceId!.toUpperCase()),
      ]);
      setResource(resourceData || null);
      setAllAnomalies(anomaliesData);
    } catch (error) {
      console.error('Failed to load resource data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChartData = () => {
    if (!resource) return;

    const now = new Date('2026-07-09');
    let daysToShow = 30;

    switch (selectedPeriod) {
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

    const filtered = resource.costTrend.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate && itemDate <= now;
    });

    setFilteredCostTrend(filtered);
  };

  const filterAnomaliesByDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = allAnomalies.filter(anomaly => {
      const anomalyDate = new Date(anomaly.date);
      return anomalyDate >= start && anomalyDate <= end;
    });

    setFilteredAnomalies(filtered);
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

  if (!resource) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-900">리소스를 찾을 수 없습니다.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>AWS</span>
          <ChevronRight size={16} />
          <Link to="/dashboard" className="text-primary hover:underline">
            {selectedPayer?.name}
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">{resource.name}</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">리소스의 비용 추이 그래프</h1>
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <CostTrendChart data={filteredCostTrend} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">이상 탐지 내역</h2>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              선택한 기간에 발생한 이상 탐지: {filteredAnomalies.length}건
            </p>
            <div className="flex items-center gap-4">
              <DatePicker
                label="날짜 범위"
                value={startDate}
                onChange={setStartDate}
              />
              <span className="text-gray-600">~</span>
              <DatePicker
                label=""
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>
          <AnomalyTable anomalies={filteredAnomalies} />
        </div>
      </div>
    </Layout>
  );
};
