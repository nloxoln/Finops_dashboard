import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
