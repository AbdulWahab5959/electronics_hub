import test from 'node:test';
import assert from 'node:assert/strict';
import { validateShipping, normalizeShipping, isQuoteExpired, shippingErrorsFromApi } from '../src/utils/checkout.js';

const valid = { fullName: 'Ali Khan', email: 'buyer@example.test', phone: '+92 (300) 123-4567', address: 'Street 1', apartment: '', city: 'Mianwali', state: 'Punjab', zipCode: '', country: 'PK' };
test('shipping allows optional postal code and landmark while trimming required fields', () => {
  assert.deepEqual(validateShipping(valid), {});
  assert.equal(normalizeShipping({ ...valid, city: ' Mianwali ' }).city, 'Mianwali');
  assert.ok(validateShipping({ ...valid, address: '   ' }).address);
});
test('shipping limits match server and reject invalid phone numbers before order review', () => {
  for (const field of ['city', 'state', 'apartment']) assert.ok(validateShipping({ ...valid, [field]: 'a'.repeat(101) })[field]);
  for (const phone of ['call me', '123', '0300abc1234', '+1234567890123456']) assert.ok(validateShipping({ ...valid, phone }).phone);
  assert.deepEqual(validateShipping({ ...valid, fullName: 'علی خان', address: 'گلی ۱' }), {});
});
test('quote expiry is checked at the exact deadline and malformed dates require refresh', () => {
  const quote = { expires_at: '2026-11-20T12:00:00Z' };
  assert.equal(isQuoteExpired(quote, Date.parse('2026-11-20T11:59:59Z')), false);
  assert.equal(isQuoteExpired(quote, Date.parse('2026-11-20T12:00:00Z')), true);
  assert.equal(isQuoteExpired({ expires_at: 'bad date' }, 0), true);
  assert.equal(isQuoteExpired(null, 0), false);
});
test('server validation errors map to the delivery field without unrelated quote errors', () => {
  assert.deepEqual(shippingErrorsFromApi({ 'shipping_address.city': ['Choose a city.'], quote_token: ['Expired.'] }), { city: 'Choose a city.' });
});
