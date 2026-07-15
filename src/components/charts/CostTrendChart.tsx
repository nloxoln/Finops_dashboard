import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CostTrendData } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface CostTrendChartProps {
  data: CostTrendData[];
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis
          dataKey="date"
          stroke="#333333"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="#333333"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), '비용']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />
        <Line
          type="linear"
          dataKey="cost"
          stroke="#5B4FFF"
          strokeWidth={2}
          dot={{ fill: '#5B4FFF', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
          animationDuration={400}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
