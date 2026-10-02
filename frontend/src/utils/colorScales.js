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
      return {
        bg: 'bg-red-50 dark:bg-red-950/40',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-300 dark:border-red-800',
        hex: '#dc2626',
      };
    case 'SEVERE':
    case 'HIGH':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-300 dark:border-orange-800',
        hex: '#ea580c',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-900 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-800',
        hex: '#d97706',
      };
    default:
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-800',
        hex: '#059669',
      };
  }
};
