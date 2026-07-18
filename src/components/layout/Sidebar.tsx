import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Cloud, AlertTriangle } from 'lucide-react';
const menuItems = [
  { path: '/dashboard', label: '메인화면', icon: LayoutDashboard },
  { path: '/anomalies', label: '이상 탐지 내역', icon: AlertTriangle },
  { path: '/reports', label: '종합보고서', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="bg-white border-r border-gray-100 w-64 fixed left-0 top-0 bottom-0 z-20">
      <div className="p-6 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Cloud className="text-primary" size={32} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">O'CLOUD</h1>
            <p className="text-sm text-primary">FinOps</p>
          </div>
        </Link>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
