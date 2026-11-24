export function readStoredArray(key, storage) {
  try {
    const value = JSON.parse((storage ?? globalThis.localStorage)?.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : [];
  } catch { return []; }
}

export function writeStoredArray(key, items, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(key, JSON.stringify(items));
    return true;
  } catch { return false; }
}

export function comparisonProductKey(product) {
  return JSON.stringify([product.brand, product.name].map(value =>
    String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()));
}

export function restoreComparison(saved, products) {
  const byId = new Map(products.map(product => [String(product.id), product]));
  const byModel = new Map(products.map(product => [comparisonProductKey(product), product]));
  const restored = [];
  const seen = new Set();
  for (const item of saved) {
    if (!item || typeof item !== 'object') continue;
    const idMatch = byId.get(String(item.id));
    // Old demo IDs could point to a different real product. Removed duplicate
    // IDs can still be recovered by matching the model against the live catalogue.
    const product = idMatch?.name === item.name ? idMatch : byModel.get(comparisonProductKey(item));
    if (!product || (restored.length && product.category !== restored[0].category)) continue;
    const key = comparisonProductKey(product);
    if (seen.has(key)) continue;
    seen.add(key);
    restored.push(product);
    if (restored.length === 4) break;
  }
  return restored;
}
