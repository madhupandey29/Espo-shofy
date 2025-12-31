// utils/searchHub.ts
const bus = typeof window !== 'undefined' ? new EventTarget() : null;
let latestQuery = '';

export type SearchEventDetail = { query: string };
export const SEARCH_EVENT = 'global-search:query';

export function publishSearchQuery(query: string) {
  latestQuery = query ?? '';
  if (!bus) return;
  bus.dispatchEvent(new CustomEvent<SearchEventDetail>(SEARCH_EVENT, { detail: { query: latestQuery } }));
}

export function subscribeSearch(handler: (q: string) => void) {
  if (!bus) return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<SearchEventDetail>).detail.query);
  bus.addEventListener(SEARCH_EVENT, listener);
  // fire immediately with current value
  handler(latestQuery);
  return () => bus.removeEventListener(SEARCH_EVENT, listener);
}

export function getLatestQuery() {
  return latestQuery;
}
