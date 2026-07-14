import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 pr-10"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
      </div>
    </div>
  );
};
