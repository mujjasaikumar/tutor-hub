import React from 'react';

const badgeStatusStyles = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  danger: 'badge-error',
  info: 'badge-info',
  default: 'badge-default',
  // Payment statuses
  paid: 'badge-success',
  unpaid: 'badge-error',
  partial: 'badge-warning',
  // Class statuses
  scheduled: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
  live: 'badge-success',
  upcoming: 'badge-info'
};

/**
 * Reusable StatusBadge component for displaying status indicators
 * @param {Object} props
 * @param {string} props.status - Status type (success, warning, error, info, etc.)
 * @param {string} props.label - Optional custom label (defaults to status)
 * @param {string} props.className - Additional CSS classes
 */
export const StatusBadge = ({
  status,
  label,
  className = ''
}) => {
  const badgeClass = badgeStatusStyles[status?.toLowerCase()] || badgeStatusStyles.default;
  
  return (
    <span className={`${badgeClass} ${className}`}>
      {label || status}
    </span>
  );
};
