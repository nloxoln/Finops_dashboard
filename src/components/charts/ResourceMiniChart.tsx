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
  if (data.length === 0) return [];

  const today = new Date(); // 실제 오늘 날짜 기준 (mock 마지막 날짜 트릭 제거)
  const last7Days: CostTrendData[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const found = data.find(d => d.date === dateStr);
    last7Days.push({
      date: dateStr.substring(5), // MM-DD
      cost: found ? found.cost : 0, // 없으면 무조건 0으로 채움 → 항상 7개 막대
    });
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
