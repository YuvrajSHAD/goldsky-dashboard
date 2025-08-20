// utils/cache.js

export function getCached(key, maxAgeMs) {
  try {
    const obj = JSON.parse(localStorage.getItem(key));
    if (!obj) return null;
    if (Date.now() - obj.timestamp > maxAgeMs) return null;
    return obj.value;
  } catch { return null; }
}

export function setCached(key, value) {
  localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
}
