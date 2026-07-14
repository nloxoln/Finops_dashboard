import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import type { CostTrendData } from '../../types';

interface ResourceMiniChartProps {
  data: CostTrendData[];
  color: string;
}

export const ResourceMiniChart: React.FC<ResourceMiniChartProps> = ({ data, color }) => {
  // 오늘 날짜 기준으로 최근 7일 데이터만 표시 (오늘 포함)
  const getLast7Days = () => {
    // Mock 데이터의 마지막 날짜를 오늘로 간주
    if (data.length === 0) return [];

    const todayStr = data[data.length - 1].date; // 마지막 날짜가 오늘
    const today = new Date(todayStr);
    const last7Days: CostTrendData[] = [];

    // 6일 전부터 오늘까지 (총 7일)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const found = data.find(d => d.date === dateStr);
      if (found) {
        last7Days.push({
          ...found,
          date: dateStr.substring(5) // MM-DD 형식으로 변환
        });
      }
    }

    return last7Days;
  };

  const chartData = getLast7Days();

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={chartData} margin={{ bottom: 20 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          stroke="#666666"
        />
        <Bar dataKey="cost" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
