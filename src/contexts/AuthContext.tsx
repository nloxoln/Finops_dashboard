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

const STORAGE_KEY = 'oclould_finops_selected_payer';

const readStoredPayer = (): Payer | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Payer) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 새로고침/뒤로가기 시 sessionStorage에서 복원
  const [selectedPayer, setSelectedPayerState] = useState<Payer | null>(readStoredPayer);

  const setSelectedPayer = (payer: Payer | null) => {
    setSelectedPayerState(payer);
    if (payer) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payer));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

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