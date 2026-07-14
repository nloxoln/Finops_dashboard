import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Anomaly } from '../../types';

interface AnomalyTableProps {
  anomalies: Anomaly[];
}

export const AnomalyTable: React.FC<AnomalyTableProps> = ({ anomalies }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (anomalies.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600">선택한 기간에 이상 탐지 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">날짜</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">제목</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">조치 필요</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {anomalies.map((anomaly) => (
            <React.Fragment key={anomaly.id}>
              <tr
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleExpand(anomaly.id)}
              >
                <td className="px-6 py-4 text-sm text-gray-900">{anomaly.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{anomaly.title}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      anomaly.actionRequired
                        ? 'bg-orange/10 text-orange'
                        : 'bg-green/10 text-green'
                    }`}
                  >
                    {anomaly.actionRequired ? '예' : '아니요'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expandedId === anomaly.id ? (
                    <ChevronUp size={20} className="text-primary" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-900" />
                  )}
                </td>
              </tr>
              {expandedId === anomaly.id && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 bg-primary-light">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">탐지된 raw 데이터:</p>
                        <p className="text-sm text-gray-900">{anomaly.rawData}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Raw 데이터의 요약:</p>
                        <p className="text-sm text-gray-900">{anomaly.summary}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">이를 바탕으로 분석된 원인:</p>
                        <p className="text-sm text-gray-900">{anomaly.cause}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
