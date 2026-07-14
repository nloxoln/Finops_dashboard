import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResourceMiniChart } from '../charts/ResourceMiniChart';
import type { Resource } from '../../types';

interface ResourceCardProps {
  resource: Resource;
  color: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, color }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/resource/${resource.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{resource.name}</h3>
      <ResourceMiniChart data={resource.costTrend} color={color} />
    </div>
  );
};
