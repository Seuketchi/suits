import { getCached, setCached } from "./cache.js";
import { rates } from "./rates.js";

export function priceFor(sku, currency, region, baseUsd) {
  const hit = getCached(sku, currency, region);
  if (hit !== undefined) return hit;
  const value = Math.round(baseUsd * rates[currency] * 100) / 100;
  setCached(sku, currency, region, value);
  return value;
}
