// Shared formatters for consistent display across the app

export const formatCurrencyMXN = (value, opts = {}) => {
  const { withCode = false, minDecimals = 0, maxDecimals = 0 } = opts;
  const num = Number(value || 0);
  const f = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(num);
  return withCode ? `${f} MXN`.replace('MX$','$') : f.replace('MX$','$');
};

export const formatNumberES = (value, opts = {}) => {
  const { minDecimals = 0, maxDecimals = 0 } = opts;
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(Number(value || 0));
};

export const formatDateTimeMX = (date) => {
  try {
    return new Date(date).toLocaleString('es-MX');
  } catch {
    return '';
  }
};
