export function formatCurrency(amount) {
  return `$${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
