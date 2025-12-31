// hooks/useGlobalSearch.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { publishSearchQuery, subscribeSearch, getLatestQuery } from '@/utils/searchHub';

function useDebounced<T>(value: T, delay = 250) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

export default function useGlobalSearch(debounceMs = 250) {
  // seed with whatever the hub last held (SSR-safe: called on client)
  const [query, setQuery] = useState<string>(getLatestQuery() || '');
  const debounced = useDebounced(query, debounceMs);

  // reflect external publishers (e.g., another component typing)
  useEffect(() => {
    const unsubscribe = subscribeSearch(setQuery);
    return () => {
      try { unsubscribe?.(); } catch(err) { console.log("Error",err)}
    };
  }, []);

  // publish when debounced changes
  useEffect(() => {
    publishSearchQuery(debounced ?? '');
  }, [debounced]);

  // ✅ auto-reset on route change
  const pathname = usePathname();
  useEffect(() => {
    // clear local state
    setQuery('');
    // notify everyone else listening to the hub
    publishSearchQuery('');
  }, [pathname]);

  // Optional: allow manual resets from callers
  const reset = useCallback(() => {
    setQuery('');
    publishSearchQuery('');
  }, []);

  return { query, setQuery, debounced, reset };
}
