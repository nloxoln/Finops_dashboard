import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { ReportList } from '../components/tables/ReportList';
import { fetchReports } from '../services/api';
import type { Report } from '../types';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">종합보고서</h1>
        <ReportList reports={reports} />
      </div>
    </Layout>
  );
};
