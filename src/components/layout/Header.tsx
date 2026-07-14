import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { selectedPayer } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900">
          {selectedPayer?.name || '계열사 선택'}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-900">임정연</span>
          <Link
            to="/mypage"
            className="flex items-center gap-2 text-sm text-gray-900 hover:text-primary transition-colors"
          >
            <User size={20} />
            <span>마이페이지</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
