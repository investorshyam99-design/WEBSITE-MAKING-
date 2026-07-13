
import { useState, useEffect } from 'react';

const RECENTLY_VIEWED_KEY = 'ju_recently_viewed';
const safeGetItem = (key: string) => { try { return window.localStorage.getItem(key); } catch (e) { return null; } };
const safeSetItem = (key: string, value: string) => { try { window.localStorage.setItem(key, value); } catch (e) {} };

const MAX_RECENT = 12;

export function addRecentlyViewed(productId: string) {
  try {
    const stored = safeGetItem(RECENTLY_VIEWED_KEY);
    let items: string[] = stored ? JSON.parse(stored) : [];
    items = items.filter(id => id !== productId); // remove if exists
    items.unshift(productId); // add to start
    if (items.length > MAX_RECENT) {
      items = items.slice(0, MAX_RECENT);
    }
    safeSetItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
  } catch (e) {
    console.error('Failed to save recently viewed', e);
  }
}

export function getRecentlyViewed(): string[] {
  try {
    const stored = safeGetItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentlyViewed());
    
    const handleUpdate = () => {
      setRecentIds(getRecentlyViewed());
    };
    
    window.addEventListener('recentlyViewedUpdated', handleUpdate);
    return () => window.removeEventListener('recentlyViewedUpdated', handleUpdate);
  }, []);

  return recentIds;
}
