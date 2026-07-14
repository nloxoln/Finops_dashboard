import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { fetchPayers } from '../services/api';
import type { Payer } from '../types';

export const PayerSelectionPage: React.FC = () => {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPayers();
  }, []);

  const loadPayers = async () => {
    try {
      const data = await fetchPayers();
      setPayers(data);
      if (data.length > 0) {
        setSelectedPayerId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load payers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = payers.find(p => p.id === selectedPayerId);
    if (selected) {
      login(selected);
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-primary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Cloud className="text-primary" size={48} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">O'CLOUD</h1>
              <p className="text-lg text-primary">FinOps</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Payer계정(계열사) 선택</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <select
              id="payer"
              value={selectedPayerId}
              onChange={(e) => setSelectedPayerId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
            >
              {payers.map((payer) => (
                <option key={payer.id} value={payer.id}>
                  {payer.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full">
            선택
          </Button>
        </form>
      </div>
    </div>
  );
};
