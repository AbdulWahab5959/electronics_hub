import test from 'node:test';
import assert from 'node:assert/strict';
import { comparisonProductKey, readStoredArray, restoreComparison, writeStoredArray } from '../src/utils/comparison.js';

const products = [
  { id: 3, brand: 'ASUS', name: 'G14', category: 'Laptops', price: 1500 },
  { id: 2, brand: 'Dell', name: 'XPS 15', category: 'Laptops', price: 1900 },
  { id: 1, brand: 'Apple', name: 'MacBook Pro', category: 'Laptops', price: 2500 },
  { id: 4, brand: 'Lenovo', name: 'X1', category: 'Laptops', price: 1600 },
  { id: 5, brand: 'HP', name: 'Spectre', category: 'Laptops', price: 1400 },
  { id: 6, brand: 'Sony', name: 'XM5', category: 'Audio', price: 350 },
];

test('reload preserves selection order and refreshes prices from the catalogue', () => {
  const saved = [{ ...products[1], price: 1 }, products[0]];
  const restored = restoreComparison(saved, products);
  assert.deepEqual(restored.map(item => item.id), [2, 3]);
  assert.equal(restored[0].price, 1900);
});

test('removed duplicate IDs resolve to the retained model only once', () => {
  const saved = [{ ...products[0], id: 25 }, products[0], products[1]];
  assert.deepEqual(restoreComparison(saved, products).map(item => item.id), [3, 2]);
});

test('mixed categories, missing products, and invalid entries do not break restoration', () => {
  const saved = [null, 'invalid', {}, products[1], products[5], { id: 999, name: 'Missing' }, products[0]];
  assert.deepEqual(restoreComparison(saved, products).map(item => item.id), [2, 3]);
});

test('no more than four distinct models are restored', () => {
  assert.deepEqual(restoreComparison(products, products).map(item => item.id), [3, 2, 1, 4]);
});

test('damaged, non-array, and unavailable browser storage return a safe empty list', () => {
  for (const raw of ['broken JSON', 'null', '{}', '42']) {
    assert.deepEqual(readStoredArray('compareItems', { getItem: () => raw }), []);
  }
  const blocked = { getItem() { throw new Error('Storage blocked'); }, setItem() { throw new Error('Storage blocked'); } };
  assert.deepEqual(readStoredArray('wishlist', blocked), []);
  assert.equal(writeStoredArray('wishlist', [], blocked), false);
  assert.deepEqual(readStoredArray('wishlist', { getItem: () => '[null, false, {"id":2}]' }), [{ id: 2 }]);
});

test('saved selections round-trip and model identity ignores category, case, and outer spaces', () => {
  let raw;
  const storage = { setItem: (_, value) => { raw = value; }, getItem: () => raw };
  assert.equal(writeStoredArray('compareItems', products.slice(0, 2), storage), true);
  assert.deepEqual(readStoredArray('compareItems', storage), products.slice(0, 2));
  assert.equal(comparisonProductKey(products[0]), comparisonProductKey({ brand: ' asus ', name: ' g14 ', category: 'Gaming' }));
});
