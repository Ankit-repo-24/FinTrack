export const formatCurrency = (amount, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatCompact = (amount, currencyCode = 'USD') => {
  if (Math.abs(amount) >= 1000000) {
    return `${new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, notation: 'compact', maximumFractionDigits: 1 }).format(amount)}`;
  }
  return formatCurrency(amount, currencyCode);
};

export const getCurrencySymbol = (currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })
    .formatToParts(0)
    .find(p => p.type === 'currency')?.value || '$';
};
