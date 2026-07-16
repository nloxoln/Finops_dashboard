import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { AnomalyTable } from '../components/tables/AnomalyTable';
import { fetchAnomalies } from '../services/api';
import type { Anomaly } from '../types';

export const AnomalyHistoryPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    try {
      const data = await fetchAnomalies();
      // 최신순 정렬 (종합보고서 리스트와 동일한 톤)
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      setAnomalies(sorted);
    } catch (error) {
      console.error('Failed to load anomalies:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">이상 비용 탐지 내역</h1>
          <p className="text-sm text-gray-600">전체 리소스 기준 이상 탐지: {anomalies.length}건</p>
        </div>
        <AnomalyTable anomalies={anomalies} />
      </div>
    </Layout>
  );
};