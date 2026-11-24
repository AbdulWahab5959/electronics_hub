import test from 'node:test';
import assert from 'node:assert/strict';
import { hydrateWishlist, moveSavedItems } from '../src/utils/wishlist.js';

test('saved products use current database prices and stock and collapse old duplicate IDs', () => {
  const live = { id: 3, name: 'ASUS Laptop', price: '1500.00', stock: 0 };
  const result = hydrateWishlist([{ id: 25, name: 'ASUS Laptop', price: 1 }, { id: '3', name: 'ASUS Laptop' }], [live]);
  assert.deepEqual(result, [{ ...live, available: true }]);
});
test('removed products remain removable but cannot be purchased using stale saved values', () => {
  const [item] = hydrateWishlist([{ id: 999, name: 'Old laptop', price: 1, stock: 99 }], []);
  assert.equal(item.available, false); assert.equal(item.stock, 0); assert.equal(item.price, undefined);
});
test('partial cart failures retain saved items and unavailable items are skipped', async () => {
  const removed = [], called = [];
  const items = [{ id: 1, available: true, stock: 4 }, { id: 2, available: true, stock: 2 }, { id: 3, available: true, stock: 0 }, { id: 4, available: false, stock: 1 }];
  const moved = await moveSavedItems(items, async item => { called.push(item.id); return item.id === 1; }, id => removed.push(id));
  assert.equal(moved, 1); assert.deepEqual(removed, [1]); assert.deepEqual(called, [1, 2]);
});
