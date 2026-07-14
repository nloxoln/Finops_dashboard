import { format, subDays, subMonths, subYears } from 'date-fns';
import { Period } from '../types';

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'yyyy-MM-dd');
};

export const getDateRange = (period: Period): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case '1d':
      startDate = subDays(endDate, 1);
      break;
    case '1w':
      startDate = subDays(endDate, 7);
      break;
    case '1m':
      startDate = subMonths(endDate, 1);
      break;
    case '3m':
      startDate = subMonths(endDate, 3);
      break;
    case '1y':
      startDate = subYears(endDate, 1);
      break;
    default:
      startDate = subMonths(endDate, 1);
  }

  return { startDate, endDate };
};
