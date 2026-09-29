/**
 * Standard Meteorological Doppler Radar (dBZ) Color Table
 */
export const DBZ_COLOR_SCALE = [
  { dbz: 10, label: '< 15 dBZ', color: '#04e9e7', desc: 'Trace Rain / Drizzle' },
  { dbz: 20, label: '20 dBZ', color: '#019ff4', desc: 'Light Rain (0.5 mm/h)' },
  { dbz: 30, label: '30 dBZ', color: '#0300f4', desc: 'Moderate Rain (2.5 mm/h)' },
  { dbz: 35, label: '35 dBZ', color: '#02fd02', desc: 'Heavy Rain (6.0 mm/h)' },
  { dbz: 40, label: '40 dBZ', color: '#01c501', desc: 'Convective Cell Initiating' },
  { dbz: 45, label: '45 dBZ', color: '#008e00', desc: 'Intense Rain (24 mm/h)' },
  { dbz: 50, label: '50 dBZ', color: '#fdfa02', desc: 'Thunderstorm (48 mm/h)' },
  { dbz: 55, label: '55 dBZ', color: '#e5bc00', desc: 'Severe Storm / Small Hail' },
  { dbz: 60, label: '60 dBZ', color: '#fd0000', desc: 'Intense Hailstorm' },
  { dbz: 65, label: '65 dBZ', color: '#d40000', desc: 'Violent Convective Core' },
  { dbz: 70, label: '> 70 dBZ', color: '#fd00fd', desc: 'Extreme Destructive Storm' },
];

export const getDbzColor = (dbz) => {
  if (dbz >= 70) return '#fd00fd';
  if (dbz >= 65) return '#d40000';
  if (dbz >= 60) return '#fd0000';
  if (dbz >= 55) return '#e5bc00';
  if (dbz >= 50) return '#fdfa02';
  if (dbz >= 45) return '#008e00';
  if (dbz >= 40) return '#01c501';
  if (dbz >= 35) return '#02fd02';
  if (dbz >= 30) return '#0300f4';
  if (dbz >= 20) return '#019ff4';
  if (dbz >= 10) return '#04e9e7';
  return '#1e293b';
};

export const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'EXTREME':
    case 'CRITICAL':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', hex: '#ef4444' };
    case 'SEVERE':
    case 'HIGH':
      return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', hex: '#f97316' };
    case 'MODERATE':
      return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500', hex: '#f59e0b' };
    default:
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500', hex: '#10b981' };
  }
};
