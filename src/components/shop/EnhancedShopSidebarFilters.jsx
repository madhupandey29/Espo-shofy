'use client';

import React, { useMemo, useState } from 'react';
import { useGetFieldValuesQuery } from '@/redux/api/apiSlice';

/* Myntra-like order */
const FIELD_FILTERS = [
  { key: 'category', label: 'CATEGORIES', searchable: false, limit: 8 },
  { key: 'brand', label: 'BRAND', searchable: true, limit: 8 },
  { key: 'color', label: 'COLOR', searchable: true, limit: 8 },
  { key: 'content', label: 'CONTENT', searchable: true, limit: 8 },
  { key: 'design', label: 'DESIGN', searchable: true, limit: 8 },
  { key: 'structure', label: 'STRUCTURE', searchable: true, limit: 8 },
  { key: 'finish', label: 'FINISH', searchable: true, limit: 8 },
  { key: 'motif', label: 'MOTIF', searchable: true, limit: 8 },
];

const UI = {
  pink: 'var(--tp-theme-primary)',
  text: 'var(--tp-text-1)',
  muted: 'var(--tp-text-2)',
  border: 'var(--tp-grey-2)',
  bg: 'var(--tp-common-white)',
};

const COLOR_MAP = {
  Red: '#ff0000',
  Blue: '#0074d9',
  Green: '#2ecc40',
  Yellow: '#ffdc00',
  Black: '#111111',
  White: '#ffffff',
  Grey: '#808080',
  Gray: '#808080',
  Brown: '#a52a2a',
  Orange: '#ff851b',
  Purple: '#b10dc9',
  Pink: '#ff69b4',
  Maroon: '#800000',
  Navy: '#001f3f',
  Teal: '#39cccc',
  Beige: '#f5f5dc',
  Olive: '#808000',
  Cream: '#fffdd0',
  Charcoal: '#36454f',
};

function normalizeOptions(rawValues) {
  const arr = Array.isArray(rawValues) ? rawValues : [];
  return arr
    .map((v) => {
      if (v == null) return null;
      if (typeof v === 'string' || typeof v === 'number') return { value: String(v), count: null };
      if (typeof v === 'object') {
        const value = v.value ?? v.name ?? v.label ?? '';
        const count = typeof v.count === 'number' ? v.count : typeof v.total === 'number' ? v.total : null;
        if (!value) return null;
        return { value: String(value), count };
      }
      return null;
    })
    .filter(Boolean);
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function EnhancedShopSidebarFilters({ onFilterChange, selected = {}, onResetAll }) {
  const [openSearch, setOpenSearch] = useState({});
  const [query, setQuery] = useState({});
  const [showAll, setShowAll] = useState({});

  const totalActive = Object.values(selected).reduce(
    (sum, v) => sum + (Array.isArray(v) ? v.length : 0),
    0
  );

  const toggleValue = (filterKey, value) => {
    const current = Array.isArray(selected?.[filterKey]) ? selected[filterKey] : [];
    const nextArr = [...current];
    const val = String(value);
    const idx = nextArr.indexOf(val);

    if (idx >= 0) nextArr.splice(idx, 1);
    else nextArr.push(val);

    const nextSelected = { ...selected };
    if (nextArr.length) nextSelected[filterKey] = nextArr;
    else delete nextSelected[filterKey];

    onFilterChange?.(nextSelected);
  };

  const clearAll = () => {
    if (typeof onResetAll === 'function') onResetAll();   // ✅ resets price too
    else onFilterChange?.({});
  };

  return (
    <aside className="myntraSidebar">
      <div className="mHeader">
        <div className="mHeaderLeft">
          <div className="mHeaderTitle">FILTERS</div>
          {totalActive > 0 && <span className="mBadge">{totalActive}</span>}
        </div>

        {totalActive > 0 && (
          <button className="mClearAll" onClick={clearAll} type="button">
            CLEAR ALL
          </button>
        )}
      </div>

      <div className="mSections">
        {FIELD_FILTERS.map((f) => (
          <FilterSection
            key={f.key}
            filter={f}
            selectedValues={selected?.[f.key] || []}
            openSearch={!!openSearch[f.key]}
            query={query[f.key] || ''}
            showAll={!!showAll[f.key]}
            setOpenSearch={(v) => setOpenSearch((p) => ({ ...p, [f.key]: v }))}
            setQuery={(v) => setQuery((p) => ({ ...p, [f.key]: v }))}
            setShowAll={(v) => setShowAll((p) => ({ ...p, [f.key]: v }))}
            onToggleValue={(val) => toggleValue(f.key, val)}
          />
        ))}
      </div>

      <style jsx global>{`
        .myntraSidebar {
          width: 100%;
          background: ${UI.bg};
          border: 1px solid ${UI.border};
          font-family: var(--tp-ff-roboto);
        }

        .mHeader {
          padding: 14px 14px 10px;
          border-bottom: 1px solid ${UI.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: ${UI.bg};
          position: sticky;
          top: 0;
          z-index: 5;
        }

        .mHeaderLeft {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mHeaderTitle {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: ${UI.text};
        }

        .mBadge {
          background: ${UI.pink};
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          line-height: 18px;
          min-width: 22px;
          text-align: center;
        }

        .mClearAll {
          border: none;
          background: transparent;
          color: ${UI.pink};
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
        }

        .mSection {
          padding: 12px 14px;
          border-bottom: 1px solid ${UI.border};
        }

        .mSectionHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .mSectionTitle {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: ${UI.text};
          text-transform: uppercase;
        }

        .mSearchBtn {
          border: none;
          background: transparent;
          padding: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: ${UI.muted};
        }

        .mSearchBtn:hover {
          background: var(--tp-grey-1);
        }

        .mSearchRow {
          margin: 10px 0 12px;
        }

        .mSearchInput {
          width: 100%;
          border: 1px solid ${UI.border};
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          outline: none;
          color: ${UI.text};
          background: ${UI.bg};
        }
        .mSearchInput:focus{
          border-color: var(--tp-theme-primary);
          box-shadow: 0 0 0 3px rgba(44, 76, 151, 0.12);
        }

        .mList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mItem {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          color: ${UI.text};
          font-size: 14px;
          line-height: 18px;
        }

        .mItem input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .mCheck {
          width: 16px;
          height: 16px;
          border: 1px solid #bfc0c6;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 16px;
          background: white;
        }

        .mItem input:checked + .mCheck {
          border-color: ${UI.pink};
          background: ${UI.pink};
        }

        .mItem input:checked + .mCheck:after {
          content: "✓";
          color: white;
          font-size: 12px;
          line-height: 12px;
          font-weight: 800;
          transform: translateY(-1px);
        }

        .mDot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid #d4d5d9;
          flex: 0 0 14px;
        }

        .mText {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mCount {
          color: ${UI.muted};
          font-size: 12px;
          flex: 0 0 auto;
        }

        .mMore {
          margin-top: 10px;
          color: ${UI.pink};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-block;
        }

        .mState {
          color: ${UI.muted};
          font-size: 13px;
          padding: 4px 0;
        }
      `}</style>
    </aside>
  );
}

function FilterSection({
  filter,
  selectedValues,
  openSearch,
  query,
  showAll,
  setOpenSearch,
  setQuery,
  setShowAll,
  onToggleValue,
}) {
  const { data, isLoading, error } = useGetFieldValuesQuery(filter.key, {
    skip: !filter.key,
  });

  const options = useMemo(() => {
    const raw = data?.values || [];
    const norm = normalizeOptions(raw);
    if (!query?.trim()) return norm;
    const q = query.trim().toLowerCase();
    return norm.filter((o) => o.value.toLowerCase().includes(q));
  }, [data, query]);

  const limited = useMemo(() => {
    const lim = filter.limit ?? 8;
    return showAll ? options : options.slice(0, lim);
  }, [options, showAll, filter.limit]);

  const remaining = Math.max(0, options.length - limited.length);

  return (
    <section className="mSection">
      <div className="mSectionHead">
        <div className="mSectionTitle">{filter.label}</div>

        {filter.searchable && (
          <button
            type="button"
            className="mSearchBtn"
            onClick={() => setOpenSearch(!openSearch)}
            aria-label="Search filter options"
            title="Search"
          >
            <SearchIcon />
          </button>
        )}
      </div>

      {filter.searchable && openSearch && (
        <div className="mSearchRow">
          <input
            className="mSearchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${filter.label.toLowerCase()}...`}
          />
        </div>
      )}

      {isLoading && <div className="mState">Loading...</div>}
      {error && <div className="mState">Failed to load</div>}

      {!isLoading && !error && (
        <>
          <div className="mList">
            {limited.map((opt) => {
              const val = opt.value;
              const checked = Array.isArray(selectedValues) && selectedValues.includes(String(val));

              const isColor = filter.key === 'color';
              const dotColor = COLOR_MAP[val] || COLOR_MAP[val?.trim?.()] || '#c9c9cf';
              const needsWhiteBorder = String(val).toLowerCase() === 'white';

              return (
                <label key={val} className="mItem" title={val}>
                  <input type="checkbox" checked={checked} onChange={() => onToggleValue(val)} />
                  <span className="mCheck" aria-hidden="true" />

                  {isColor && (
                    <span
                      className="mDot"
                      style={{
                        background: dotColor,
                        borderColor: needsWhiteBorder ? '#bfc0c6' : '#d4d5d9',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  <span className="mText">{val}</span>

                  {typeof opt.count === 'number' && <span className="mCount">({opt.count})</span>}
                </label>
              );
            })}
          </div>

          {remaining > 0 && (
            <span className="mMore" onClick={() => setShowAll(true)}>
              + {remaining} more
            </span>
          )}

          {showAll && options.length > (filter.limit ?? 8) && (
            <span className="mMore" onClick={() => setShowAll(false)} style={{ marginLeft: 12 }}>
              Show less
            </span>
          )}
        </>
      )}
    </section>
  );
}
