import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import type { Report } from '../../types';

interface ReportListProps {
  reports: Report[];
}

export const ReportList: React.FC<ReportListProps> = ({ reports }) => {
  const navigate = useNavigate();

  const handleDownload = (e: React.MouseEvent, pdfUrl: string) => {
    e.stopPropagation();
    alert('PDF 다운로드 기능은 백엔드 구현 후 활성화됩니다.\n다운로드 URL: ' + pdfUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">제목</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작성일</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">다운로드</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reports.map((report) => (
            <tr
              key={report.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <td className="px-6 py-4 text-sm text-gray-900">{report.title}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{report.createdAt}</td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={(e) => handleDownload(e, report.pdfUrl)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download size={16} />
                  <span className="text-sm">PDF</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
