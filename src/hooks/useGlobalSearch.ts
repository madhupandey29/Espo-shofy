// hooks/useGlobalSearch.ts
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // seed with hub value (client safe)
  const [query, setQuery] = useState<string>(() => getLatestQuery() || '');
  const debounced = useDebounced(query, debounceMs);

  // avoid publish loops
  const lastPublishedRef = useRef<string>('');

  // reflect external publishers
  useEffect(() => {
    const unsubscribe = subscribeSearch((v: string) => {
      setQuery((prev) => (prev === v ? prev : v));
    });
    return () => {
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  // ✅ if on /shop, sync input from URL (?q= / ?searchText=)
  useEffect(() => {
    if (!pathname?.includes('/shop')) return;

    const urlQ = (searchParams?.get('q') || searchParams?.get('searchText') || '').trim();

    setQuery((prev) => (prev === urlQ ? prev : urlQ));

    // publish immediately so other listeners (shop page) are aligned
    if (lastPublishedRef.current !== urlQ) {
      lastPublishedRef.current = urlQ;
      publishSearchQuery(urlQ);
    }
  }, [pathname, searchParams]);

  // publish when debounced changes
  useEffect(() => {
    const q = (debounced ?? '').toString();
    if (lastPublishedRef.current === q) return;
    lastPublishedRef.current = q;
    publishSearchQuery(q);
  }, [debounced]);

  // ✅ auto-reset when leaving shop
  useEffect(() => {
    if (!pathname) return;

    if (!pathname.includes('/shop')) {
      setQuery('');
      if (lastPublishedRef.current !== '') {
        lastPublishedRef.current = '';
        publishSearchQuery('');
      }
    }
  }, [pathname]);

  const reset = useCallback(() => {
    setQuery('');
    lastPublishedRef.current = '';
    publishSearchQuery('');
  }, []);

  return { query, setQuery, debounced, reset };
}
