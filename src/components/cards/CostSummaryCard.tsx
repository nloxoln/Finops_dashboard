import React from 'react';
import { formatCurrency } from '../../utils/dateUtils';

interface CostSummaryCardProps {
  title: string;
  amount: number;
  bgColor: string;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({ title, amount, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 text-white shadow-sm`}>
      <h3 className="text-sm font-medium mb-2 opacity-90">{title}</h3>
      <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
    </div>
  );
};
