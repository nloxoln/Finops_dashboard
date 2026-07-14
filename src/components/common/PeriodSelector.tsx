import React from 'react';
import type { Period } from '../../types';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

const periods: { label: string; value: Period }[] = [
  { label: '1일', value: '1d' },
  { label: '1주일', value: '1w' },
  { label: '1달', value: '1m' },
  { label: '3달', value: '3m' },
  { label: '1년', value: '1y' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedPeriod === period.value
              ? 'bg-primary text-white'
              : 'bg-white text-gray-900 border border-gray-100 hover:bg-gray-50'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};
