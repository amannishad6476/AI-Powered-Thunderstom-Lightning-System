import React from 'react';
import { AlertTriangle, Zap, CloudRain, Flame } from 'lucide-react';
import { getSeverityColor } from '../../utils/colorScales';

export const AlertBadge = ({ severity = 'MODERATE', label, type = 'LIGHTNING' }) => {
  const color = getSeverityColor(severity);

  const getIcon = () => {
    switch (type) {
      case 'LIGHTNING':
        return <Zap className="w-3.5 h-3.5 mr-1" />;
      case 'PRECIP':
        return <CloudRain className="w-3.5 h-3.5 mr-1" />;
      case 'EXTREME':
        return <Flame className="w-3.5 h-3.5 mr-1" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color.bg} ${color.text} ${color.border} animate-pulse`}
    >
      {getIcon()}
      {label || severity}
    </span>
  );
};
