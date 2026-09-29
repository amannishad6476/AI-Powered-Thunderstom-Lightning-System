export const formatUTC = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toUTCString().replace('GMT', 'UTC');
};

export const formatLocalIST = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatOffsetLabel = (offsetMin) => {
  if (offsetMin === 0) return 'Live Now (T+0)';
  if (offsetMin < 0) return `Observed (${offsetMin}m)`;
  return `AI Nowcast (+${offsetMin}m)`;
};
