// Saved IDs live in this browser; every displayed product comes from the live catalogue.
export function hydrateWishlist(saved, catalogue) {
  const seen = new Set();
  const normalize = value => typeof value === 'string' ? value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase() : '';
  return saved.flatMap(item => {
    const product = catalogue.find(p => String(p.id) === String(item.id))
      ?? catalogue.find(p => normalize(item.name) && normalize(p.name) === normalize(item.name));
    const key = String(product?.id ?? item.id);
    if (!item.id || seen.has(key)) return [];
    seen.add(key);
    return [product ? { ...product, available: true } : { id: item.id, name: item.name || 'Unavailable product', image: item.image, available: false, stock: 0 }];
  });
}

export async function moveSavedItems(items, addToCart, removeSaved) {
  let moved = 0;
  for (const item of items) {
    if (!item.available || Number(item.stock) <= 0) continue;
    if (await addToCart(item, 1)) {
      moved++;
      removeSaved(item.id);
    }
  }
  return moved;
}
