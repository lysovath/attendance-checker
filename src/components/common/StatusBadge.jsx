// src/components/common/StatusBadge.jsx
import React from 'react';

export const STATUS_TYPES = ['Present', 'Absent', 'Late', 'Excused'];

export const StatusBadge = ({ status }) => {
  const styles = {
    Present: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Absent: 'bg-rose-100 text-rose-800 border-rose-200',
    Late: 'bg-amber-100 text-amber-800 border-amber-200',
    Excused: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};