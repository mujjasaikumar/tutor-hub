import React from 'react';

export function StatusBadge({ status }) {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'bg-green-100 text-green-700 border border-green-300 animate-pulse';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'unpaid':
        return 'bg-red-100 text-red-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle()}`}>
      {status}
    </span>
  );
}
