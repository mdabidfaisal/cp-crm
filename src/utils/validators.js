export function required(value) {
  if (!value || (typeof value === 'string' && !value.trim())) return 'This field is required';
  return null;
}

export function isEmail(value) {
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email address';
}

export function isPositiveNumber(value) {
  if (!value) return null;
  return parseFloat(value) > 0 ? null : 'Must be a positive number';
}
