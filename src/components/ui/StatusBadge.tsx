import React from 'react';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive, className }) => {
  const statusText = isActive ? 'Aktywny' : 'Nieaktywny';
  const badgeColor = isActive ? 'bg-success-green' : 'bg-gray-400';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white',
        badgeColor,
        className
      )}
    >
      {statusText}
    </span>
  );
};

export default StatusBadge;