import test from 'node:test';
import assert from 'node:assert/strict';
import { canCancelOrder, formatOrderDate, filterOrders, orderPage, itemCount } from '../src/utils/orders.js';
import { dashboardSummary, dashboardOrders } from '../src/utils/dashboard.js';

const orders = [
  { id: 1, order_number: 'ORD-ONE', status: 'pending', payment_status: 'awaiting_collection', total: '10.10', currency: 'PKR', created_at: '2026-11-19T20:00:00Z', items: [{ name: 'ASUS Laptop', quantity: '2' }] },
  { id: 2, order_number: 'ORD-TWO', status: 'shipped', payment_status: 'awaiting_collection', total: '20.20', currency: 'PKR', created_at: '2026-11-19T20:00:00Z', items: [{ name: 'Lenovo Laptop', quantity: 1 }] },
  { id: 3, order_number: 'ORD-THREE', status: 'delivered', total: '10.10', currency: 'PKR', created_at: '2026-11-18T20:00:00Z', items: [] },
  { id: 4, order_number: 'ORD-FOUR', status: 'delivered', total: '20.20', currency: 'PKR', created_at: '2026-11-17T20:00:00Z', items: [] },
  { id: 5, order_number: 'ORD-FIVE', status: 'cancelled', total: '9999.99', currency: 'PKR', created_at: '2026-11-16T20:00:00Z', items: [] },
];
test('search and status are combined, normalized and only search order refs or snapshots', () => {
  assert.deepEqual(filterOrders(orders, '  ＡＳＵＳ ', 'all').map(x => x.id), [1]);
  assert.deepEqual(filterOrders(orders, 'laptop', 'shipped').map(x => x.id), [2]);
  assert.deepEqual(filterOrders(orders, 'ord-tw', 'all').map(x => x.id), [2]);
  assert.equal(filterOrders(orders, 'no match', 'all').length, 0);
  assert.equal(filterOrders(orders, '', 'all').length, 5);
  assert.deepEqual(filterOrders(orders, '', 'active').map(x => x.id), [1, 2]);
});
test('pagination clamps after filtering and never repeats or drops records', () => {
  const data = Array.from({ length: 17 }, (_, id) => ({ id }));
  assert.deepEqual([1, 2, 3].flatMap(page => orderPage(data, page).items).map(x => x.id), data.map(x => x.id));
  assert.equal(orderPage(data, '999').page, 3);
  assert.equal(orderPage(data, '-2').page, 1);
  assert.equal(orderPage(data, 'nonsense').page, 1);
  assert.deepEqual(orderPage([], 7), { page: 1, pages: 1, items: [], from: 0, to: 0 });
  assert.equal(orderPage(data.slice(0, 2), 3).to, 2);
});
test('cancel eligibility agrees with pending unpaid server contract', () => {
  assert.equal(canCancelOrder(orders[0]), true);
  for (const status of ['processing', 'shipped', 'delivered', 'cancelled']) assert.equal(canCancelOrder({ status, payment_status: 'awaiting_collection' }), false);
  for (const payment_status of ['paid', 'refunded', 'cancelled', 'failed', undefined]) assert.equal(canCancelOrder({ status: 'pending', payment_status }), false);
  assert.equal(canCancelOrder(null), false);
});
test('quantities are numeric and dates use Pakistan timezone across UTC midnight', () => {
  assert.equal(itemCount([{ quantity: '2' }, { quantity: 1 }]), 3);
  assert.equal(itemCount(null), 0);
  assert.match(formatOrderDate('2026-11-19T20:00:00Z'), /20/);
  assert.match(formatOrderDate('2026-11-19T20:00:00Z', true), /PKT$/);
  assert.equal(formatOrderDate('invalid'), 'Date unavailable');
});
test('dashboard totals include cancelled counts but only delivered PKR value, with exact minor units', () => {
  assert.deepEqual(dashboardSummary(orders), { total: 5, active: 2, deliveredMinor: 3030 });
  assert.deepEqual(dashboardSummary([]), { total: 0, active: 0, deliveredMinor: 0 });
  assert.equal(dashboardSummary([...orders, { status: 'delivered', total: '500', currency: 'USD' }]).deliveredMinor, 3030);
});
test('dashboard filters and stable newest-first sort never mutate source', () => {
  const before = orders.map(x => x.id);
  assert.deepEqual(dashboardOrders(orders, 'all').map(x => x.id), [2, 1, 3, 4, 5]);
  assert.deepEqual(dashboardOrders(orders, 'active').map(x => x.id), [2, 1]);
  assert.deepEqual(dashboardOrders(orders, 'delivered').map(x => x.id), [3, 4]);
  assert.deepEqual(orders.map(x => x.id), before);
});
