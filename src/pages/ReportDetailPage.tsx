import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { fetchReportById } from '../services/api';
import type { Report } from '../types';

export const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    try {
      const data = await fetchReportById(reportId!);
      setReport(data || null);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    alert('PDF 다운로드 기능은 백엔드 구현 후 활성화됩니다.');
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

  if (!report) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-900">보고서를 찾을 수 없습니다.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download size={20} />
            <span>PDF 다운로드</span>
          </Button>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">작성일: {report.createdAt}</p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">비용 분석 요약</h2>
            <p className="text-gray-900 mb-6">
              본 보고서는 {report.createdAt.substring(0, 7)} 기간 동안의 AWS 비용 사용 현황을 분석한 자료입니다.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">주요 내용</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-900 mb-6">
              <li>총 비용: $148,322.41</li>
              <li>전월 대비 증가율: +12.3%</li>
              <li>주요 비용 발생 서비스: EC2, RDS, Lambda</li>
              <li>이상 탐지 건수: 4건</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">권장 사항</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-900 mb-6">
              <li>미사용 EC2 인스턴스 정리 필요</li>
              <li>RDS 스토리지 자동 확장 설정 검토</li>
              <li>Lambda 함수 최적화로 비용 절감 가능</li>
            </ul>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-600 text-center">
                상세한 내용은 PDF 파일을 다운로드하여 확인하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
