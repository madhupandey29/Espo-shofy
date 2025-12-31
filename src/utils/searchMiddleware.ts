// utils/searchMiddleware.ts

export type FieldGetter<T> =
  | keyof T
  | ((item: T) => string | number | boolean | null | undefined);

export type FilterOptions = {
  /** All tokens must match (AND, default) or any token can match (OR) */
  mode?: 'AND' | 'OR';
  /** Lowercase + remove accents/diacritics (default true) */
  normalize?: boolean;
  /** Ignore very short tokens; default 1 (use 2 if you want less noise) */
  minTokenLen?: number;
};

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Convert any value to a readable string for search (no `any`) */
const toText = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join(' ');
  if (isPlainObject(v)) {
    // Try common display-style fields first
    const preferred =
      (v.name as unknown) ??
      (v.title as unknown) ??
      (v.label as unknown) ??
      (v.value as unknown) ??
      (v.text as unknown);

    if (preferred != null) return toText(preferred);

    try {
      return Object.values(v)
        .map(toText)
        .filter(Boolean)
        .join(' ');
    } catch {
      return '';
    }
  }
  return '';
};

/** Combining mark ranges (Unicode) we want to drop after NFD split */
const COMBINING_MARK_RANGES: Array<[number, number]> = [
  [0x0300, 0x036f], // Combining Diacritical Marks
  [0x1ab0, 0x1aff], // Combining Diacritical Marks Extended
  [0x1dc0, 0x1dff], // Combining Diacritical Marks Supplement
  [0x20d0, 0x20ff], // Combining Diacritical Marks for Symbols
  [0xfe20, 0xfe2f], // Combining Half Marks
];

const isCombiningMark = (codePoint: number): boolean =>
  COMBINING_MARK_RANGES.some(([a, b]) => codePoint >= a && codePoint <= b);

/** Remove diacritics *without* regex character classes */
const removeDiacritics = (s: string): string => {
  const nfd = s.normalize('NFD');
  let out = '';
  for (const ch of nfd) {
    const cp = ch.codePointAt(0);
    if (cp == null || !isCombiningMark(cp)) out += ch;
  }
  return out;
};

/** Normalize text for matching */
const norm = (s: unknown, doNormalize: boolean): string => {
  const base = toText(s);
  if (!doNormalize) return base;
  return removeDiacritics(base).toLowerCase();
};

/** Tokenize a query into words (letters/digits) */
const tokenize = (
  q: string,
  doNormalize: boolean,
  minTokenLen: number
): string[] => {
  const cleaned = norm(q || '', doNormalize);
  // Split on any non-alphanumeric; safe across runtimes
  return cleaned
    .split(/[^a-z0-9]+/i)
    .filter((t) => t && t.length >= Math.max(1, minTokenLen));
};

/** Safely read a field from an item and normalize it */
const readField = <T,>(
  item: T,
  getter: FieldGetter<T>,
  doNormalize: boolean
): string => {
  try {
    const v =
      typeof getter === 'function' ? getter(item) : (item as T)[getter as keyof T];
    return norm(v, doNormalize);
  } catch {
    return '';
  }
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

export function buildSearchPredicate<T>(
  query: string,
  fields: FieldGetter<T>[],
  opts: FilterOptions = {}
) {
  const { mode = 'AND', normalize = true, minTokenLen = 1 } = opts;

  const tokens = tokenize(query, normalize, minTokenLen);
  if (tokens.length === 0 || !Array.isArray(fields) || fields.length === 0) {
    // No query or no fields -> always match
    return (_item: T) => true;
  }

  return (item: T) => {
    // Concatenate all searchable fields for the item
    const haystack = fields
      .map((f) => readField(item, f, normalize))
      .filter((s) => s.length > 0)
      .join(' | ');

    if (haystack.length === 0) return false;

    if (mode === 'OR') {
      return tokens.some((t) => haystack.includes(t));
    }
    // AND (default)
    return tokens.every((t) => haystack.includes(t));
  };
}

export function filterItems<T>(
  items: T[] | null | undefined,
  query: string,
  fields: FieldGetter<T>[],
  opts: FilterOptions = {}
): T[] {
  const list = Array.isArray(items) ? items : [];
  const pred = buildSearchPredicate<T>(query, fields, opts);
  return list.filter(pred);
}
