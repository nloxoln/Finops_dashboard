import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Payer } from '../types';

interface AuthContextType {
  selectedPayer: Payer | null;
  setSelectedPayer: (payer: Payer | null) => void;
  isAuthenticated: boolean;
  login: (payer: Payer) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPayer, setSelectedPayer] = useState<Payer | null>(null);

  const login = (payer: Payer) => {
    setSelectedPayer(payer);
  };

  const logout = () => {
    setSelectedPayer(null);
  };

  const isAuthenticated = selectedPayer !== null;

  return (
    <AuthContext.Provider value={{ selectedPayer, setSelectedPayer, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
