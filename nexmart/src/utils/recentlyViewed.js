const KEY = 'nexmart_recent';
const MAX = 6;

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addRecentlyViewed(id) {
  const ids = getRecentlyViewed().filter(x => x !== id);
  ids.unshift(id);
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
}
