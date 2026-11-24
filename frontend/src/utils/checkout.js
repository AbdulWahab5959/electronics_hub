export const shippingFields = [
  { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name', max: 255, required: true },
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', max: 255, required: true },
  { name: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', max: 30, required: true },
  { name: 'zipCode', label: 'Postal code', type: 'text', autoComplete: 'postal-code', max: 20 },
  { name: 'address', label: 'Street address', type: 'text', autoComplete: 'address-line1', max: 500, required: true, wide: true },
  { name: 'apartment', label: 'Apartment / landmark', type: 'text', autoComplete: 'address-line2', max: 100, wide: true },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', max: 100, required: true },
  { name: 'state', label: 'Province / region', type: 'text', autoComplete: 'address-level1', max: 100, required: true },
];

export function normalizeShipping(shipping) {
  return Object.fromEntries(Object.entries(shipping).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
}

export function validateShipping(shipping) {
  const clean = normalizeShipping(shipping);
  const errors = {};
  for (const field of shippingFields) {
    if (field.required && !clean[field.name]) errors[field.name] = `Enter your ${field.label.toLowerCase()}.`;
    else if (String(clean[field.name] || '').length > field.max) errors[field.name] = `Use no more than ${field.max} characters.`;
  }
  if (clean.phone && (!/^\+?[0-9\s().-]+$/.test(clean.phone) || clean.phone.replace(/\D/g, '').length < 7 || clean.phone.replace(/\D/g, '').length > 15)) errors.phone = 'Enter a phone number with 7–15 digits.';
  return errors;
}

export function isQuoteExpired(quote, now) {
  if (!quote) return false;
  const expires = Date.parse(quote.expires_at);
  return !Number.isFinite(expires) || expires <= now;
}

export function shippingErrorsFromApi(errors = {}) {
  return Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith('shipping_address.')).map(([key, messages]) => [key.replace('shipping_address.', ''), Array.isArray(messages) ? messages[0] : messages]));
}
