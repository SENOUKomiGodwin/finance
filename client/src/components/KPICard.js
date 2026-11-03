import React from 'react';

const KPICard = ({ title, value, icon, trend }) => {
  const trendColor = trend === 'positive' ? 'text-green-500' : 'text-red-500';
  const trendIcon = trend === 'positive' ? '↑' : '↓';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="flex-shrink-0">{icon}</div>
      </div>
      {trend && (
        <div className={`mt-2 text-sm ${trendColor}`}>
          {trendIcon} {trend === 'positive' ? 'Positive' : 'Negative'} trend
        </div>
      )}
    </div>
  );
};

export default KPICard;
