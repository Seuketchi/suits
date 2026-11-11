const store = new Map();

export function priceKey(sku, currency, region) {
  return `price:${sku}:${region}`;
}

export function getCached(sku, currency, region) {
  return store.get(priceKey(sku, currency, region));
}

export function setCached(sku, currency, region, value) {
  store.set(priceKey(sku, currency, region), value);
}
