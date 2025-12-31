import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGetFilterOptionsQuery } from "@/redux/api/apiSlice";

/* ------------------ Config ------------------ */
const FILTERS = [
  { key: "category",    label: "Category",     api: "category/",    icon: "📁" },
  { key: "color",       label: "Color",        api: "color/",       icon: "🎨" },
  { key: "content",     label: "Content",      api: "content/",     icon: "🧵" },
  { key: "design",      label: "Design",       api: "design/",      icon: "✨" },
  {
    key: "structure",
    label: "Structure",
    api: "structure/",
    sub: { key: "substructure", label: "Sub-structure", api: "substructure/" },
    icon: "🏗️",
  },
  {
    key: "finish",
    label: "Finish",
    api: "finish/",
    sub: { key: "subfinish", label: "Sub-finish", api: "subfinish/" },
    icon: "🔧",
  },
  {
    key: "suitablefor",
    label: "Suitable For",
    api: "suitablefor/",
    sub: { key: "subsuitable", label: "Sub-suitable", api: "subsuitable/" },
    icon: "👕",
  },
  { key: "motifsize",   label: "Motif Size",   api: "motif/",       icon: "📐" },
];

export const FILTERS_MAP = Object.fromEntries(FILTERS.map((f) => [f.key, f]));

const getOptions = (d = []) =>
  Array.isArray(d) ? d : d?.data ?? d?.results ?? d?.items ?? d?.docs ?? [];

const getNameAndValue = (o) => {
  const v = o?._id ?? o?.id ?? o?.value ?? o?.slug ?? o?.name;
  const n = o?.name ?? o?.parent ?? o?.title ?? String(v);
  return { value: String(v), name: String(n) };
};

/* =======================================================
   Sidebar Component
======================================================= */
export default function ShopSidebarFilters({
  onFilterChange,
  selected = {},
  hideTitle = false,
  mobile = false,
  mobileSingle = false,
  onOpenFilter,
}) {
  const sidebarRef = useRef(null);
  const [active, setActive] = useState(null);
  const [pos, setPos] = useState({ left: 420, top: 80, maxHeight: 560 });

  const measureLeft = () => {
    const r = sidebarRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos((p) => ({ ...p, left: Math.round(r.right + 24) }));
  };

  useEffect(() => {
    measureLeft();
    const onResize = () => measureLeft();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const openFor = (filter, rowEl) => {
    if (mobile && mobileSingle) {
      onOpenFilter?.(filter.key);
      return;
    }
    const r = rowEl?.getBoundingClientRect?.();
    const margin = 16;
    const idealTop = r ? r.top + 12 : 32;
    const maxH = window.innerHeight - margin * 2;
    const clampedTop = Math.max(
      margin,
      Math.min(idealTop, window.innerHeight - margin - 420)
    );
    setPos((p) => ({ ...p, top: clampedTop, maxHeight: maxH }));
    setActive(filter);
  };

  const clearKey = (key) => {
    const next = { ...selected };
    delete next[key];
    onFilterChange(next);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const totalActiveFilters = Object.values(selected).reduce(
    (total, current) =>
      total + (Array.isArray(current) ? current.length : 0),
    0
  );

  return (
    <div className="sidebar-card" ref={sidebarRef}>
      {/* Header */}
      {!hideTitle && (
        <div className="sidebar-header">
          <h3 className="sidebar-title">Filters</h3>
          {totalActiveFilters > 0 && (
            <button
              onClick={clearAllFilters}
              className="clear-all-btn"
              aria-label="Clear all filters"
            >
              Clear all
              <span className="clear-all-icon">×</span>
            </button>
          )}
        </div>
      )}

      {/* Filter List */}
      <div className="sidebar-scroll">
        {FILTERS.map((f) => {
          const count = Array.isArray(selected[f.key])
            ? selected[f.key].length
            : 0;
          return (
            <button
              key={f.key}
              type="button"
              className={`filter-row ${
                count > 0 ? "filter-row-active" : ""
              }`}
              onClick={(e) => openFor(f, e.currentTarget)}
              aria-haspopup="dialog"
              aria-expanded={!!active && active.key === f.key}
            >
              <span className="filter-row-content">
                <span className="filter-row__label">{f.label}</span>
              </span>
              <span className="filter-row__actions">
                {count > 0 && <span className="pill-count">{count}</span>}
                <ChevronRight />
              </span>
            </button>
          );
        })}
      </div>

      {/* Flyout */}
      {active && (
        <EnhancedFilterFlyout
          anchorLeft={pos.left}
          anchorTop={pos.top}
          maxHeight={pos.maxHeight}
          filter={active}
          selected={selected}
          onClear={() => clearKey(active.key)}
          onClose={() => setActive(null)}
          applyDraft={(next) => {
            onFilterChange(next);
          }}
        />
      )}

      <style jsx global>{`
        .sidebar-card {
          --primary: var(--tp-theme-primary);
          --primary-dark: #1e326b;
          --success: #10b981;
          --danger: #ef4444;
          --ink: #0f172a;
          --muted: #64748b;
          --line: rgba(15, 23, 42, 0.08);

          background: #fff;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
          font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .sidebar-title {
          margin: 0;
          font: 600 18px/1.2 "Inter", system-ui;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .clear-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          color: var(--danger);
          font: 500 13px "Inter", system-ui;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-btn:hover {
          background: #fef2f2;
          transform: translateY(-1px);
        }

        .clear-all-icon {
          font-size: 16px;
          font-weight: 600;
        }

        .sidebar-scroll {
          max-height: calc(100vh - 140px);
          overflow: auto;
          padding-right: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        .filter-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          margin: 6px 0;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-row:hover {
          background: #f8fafc;
          border-color: var(--primary);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
          transform: translateY(-1px);
        }

        .filter-row-active {
          border-color: var(--primary);
          background: #f1f5ff;
        }

        .filter-row-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-row__label {
          font: 600 15px/1.2 "Inter", system-ui;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .filter-row__actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pill-count {
          min-width: 22px;
          height: 20px;
          padding: 0 8px;
          border-radius: 999px;
          background: var(--primary);
          color: #fff;
          font: 600 11px/20px "Inter", system-ui;
          text-align: center;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

/* =======================================================
   Enhanced Filter Flyout
======================================================= */
export function EnhancedFilterFlyout({
  anchorLeft,
  anchorTop,
  maxHeight,
  filter,
  selected,
  onClear,
  onClose,
  applyDraft,
  centered = false,
  portalTarget = undefined,
}) {
  const panelRef = useRef(null);
  const footerRef = useRef(null);

  const [draft, setDraft] = useState(() => {
    const obj = {};
    obj[filter.key] = (Array.isArray(selected[filter.key])
      ? selected[filter.key]
      : []
    ).map(String);
    if (filter.sub?.key) {
      obj[filter.sub.key] = (
        Array.isArray(selected[filter.sub.key]) ? selected[filter.sub.key] : []
      ).map(String);
    }
    return obj;
  });

  const triggerMainRef = useRef(null);
  const [openMain, setOpenMain] = useState(false);
  const [maxHMain, setMaxHMain] = useState(320);

  const hasSub = !!filter.sub;
  const triggerSubRef = useRef(null);
  const [openSub, setOpenSub] = useState(false);
  const [maxHSub, setMaxHSub] = useState(320);

  const { data, isLoading, error } = useGetFilterOptionsQuery(filter.api, {
    skip: !filter,
  });
  const options = getOptions(data);
  const {
    data: subData,
    isLoading: subLoading,
    error: subError,
  } = useGetFilterOptionsQuery(filter.sub?.api, { skip: !hasSub });
  const subOptions = getOptions(subData);

  useEffect(() => {
    const onDown = (e) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const computeMaxHeight = (ref, setter) => {
    const r = ref.current?.getBoundingClientRect();
    const fr = footerRef.current?.getBoundingClientRect();
    if (!r || !fr) return;
    const spaceToFooter = Math.floor(fr.top - r.bottom - 12);
    const desired = 420;
    const clamped = Math.max(160, Math.min(desired, spaceToFooter));
    setter(clamped);
  };

  useEffect(() => {
    if (openMain) {
      computeMaxHeight(triggerMainRef, setMaxHMain);
      const f = () => computeMaxHeight(triggerMainRef, setMaxHMain);
      window.addEventListener("resize", f);
      window.addEventListener("scroll", f, { passive: true });
      return () => {
        window.removeEventListener("resize", f);
        window.removeEventListener("scroll", f);
      };
    }
  }, [openMain]);

  useEffect(() => {
    if (openSub) {
      computeMaxHeight(triggerSubRef, setMaxHSub);
      const f = () => computeMaxHeight(triggerSubRef, setMaxHSub);
      window.addEventListener("resize", f);
      window.addEventListener("scroll", f, { passive: true });
      return () => {
        window.removeEventListener("resize", f);
        window.removeEventListener("scroll", f);
      };
    }
  }, [openSub]);

  const toggleDraft = (key, rawValue) => {
    const value = String(rawValue);
    setDraft((d) => {
      const cur = new Set(d[key] || []);
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      return { ...d, [key]: [...cur] };
    });
  };

  const valuesMain = draft[filter.key] || [];
  const valuesSub = filter.sub?.key ? draft[filter.sub.key] || [] : [];

  const toggleMain = () => setOpenMain((v) => !v);
  const toggleSub = () => setOpenSub((v) => !v);

  const panelStyle = centered
    ? {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "12vh",
        width: 480,
        maxWidth: "92vw",
        maxHeight: "76vh",
        background: "#fff",
        borderRadius: 24,
        boxShadow:
          "0 32px 64px rgba(0,0,0,.16), 0 8px 24px rgba(0,0,0,.08)",
        zIndex: 41,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, system-ui",
        border: "1px solid rgba(255,255,255,0.1)",
      }
    : {
        position: "fixed",
        left: Math.max(12, anchorLeft),
        top: anchorTop,
        width: 480,
        maxWidth: "92vw",
        maxHeight,
        background: "#fff",
        borderRadius: 24,
        boxShadow:
          "0 32px 64px rgba(0,0,0,.16), 0 8px 24px rgba(0,0,0,.08)",
        zIndex: 41,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, system-ui",
        border: "1px solid rgba(255,255,255,0.1)",
      };

  const Backdrop = (
    <div
      style={{
        position: centered ? "absolute" : "fixed",
        inset: 0,
        // no blur / dark overlay so background stays visible
        background: "transparent",
        zIndex: 40,
        animation: "fadeIn 0.2s ease-out",
      }}
    />
  );

  const Panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      className="filter-panel enter"
      style={panelStyle}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(15,23,42,.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f8fafc, #fff)",
        }}
      >
        <div>
          <div
            style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}
          >
            {filter.label}
          </div>
          {(valuesMain.length > 0 || valuesSub.length > 0) && (
            <div
              style={{
                fontWeight: 500,
                fontSize: 13,
                color: "#64748b",
                marginTop: 2,
              }}
            >
              {valuesMain.length + valuesSub.length} selected
            </div>
          )}
        </div>
        <button onClick={onClose} className="x-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px 16px", flex: 1 }}>
        {/* Main select (no duplicate label) */}
        <div style={{ marginBottom: hasSub ? 20 : 0 }}>
          <button
            ref={triggerMainRef}
            type="button"
            className="enhanced-select-trigger"
            aria-haspopup="listbox"
            aria-expanded={openMain}
            onClick={toggleMain}
          >
            <span
              style={{
                color: valuesMain.length ? "#0f172a" : "#94a3b8",
                fontWeight: 600,
              }}
            >
              {valuesMain.length
                ? `${valuesMain.length} selected`
                : `Choose ${filter.label}`}
            </span>
            <EnhancedChevronDown className={openMain ? "rot" : ""} />
          </button>

          {openMain && (
            <EnhancedDropdownPortal
              anchorRef={triggerMainRef}
              maxHeight={maxHMain}
              portalTarget={portalTarget}
            >
              <EnhancedMenuContent
                options={options}
                isLoading={isLoading}
                error={error}
                values={valuesMain}
                onPick={(value) => {
                  // keep dropdown open – no auto-close
                  toggleDraft(filter.key, value);
                }}
              />
            </EnhancedDropdownPortal>
          )}
        </div>

        {/* Sub-select */}
        {hasSub && (
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                color: "#374151",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {filter.sub.label}
            </label>
            <button
              ref={triggerSubRef}
              type="button"
              className="enhanced-select-trigger"
              aria-haspopup="listbox"
              aria-expanded={openSub}
              onClick={toggleSub}
            >
              <span
                style={{
                  color: valuesSub.length ? "#0f172a" : "#94a3b8",
                  fontWeight: 600,
                }}
              >
                {valuesSub.length
                  ? `${valuesSub.length} selected`
                  : `Choose ${filter.sub.label}`}
              </span>
              <EnhancedChevronDown className={openSub ? "rot" : ""} />
            </button>

            {openSub && (
              <EnhancedDropdownPortal
                anchorRef={triggerSubRef}
                maxHeight={maxHSub}
              >
                <EnhancedMenuContent
                  options={subOptions}
                  isLoading={subLoading}
                  error={subError}
                  values={valuesSub}
                  onPick={(value) => {
                    // keep dropdown open
                    toggleDraft(filter.sub.key, value);
                  }}
                />
              </EnhancedDropdownPortal>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        ref={footerRef}
        style={{
          marginTop: "auto",
          padding: "20px 24px",
          borderTop: "1px solid rgba(15,23,42,.06)",
          display: "flex",
          gap: 12,
          position: "relative",
          zIndex: 120,
          background: "#fff",
        }}
      >
        <button
          type="button"
          onClick={onClear}
          className="enhanced-link-clear"
          disabled={
            valuesMain.length === 0 && valuesSub.length === 0
          }
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            const merged = { ...selected, ...draft };
            if (
              Array.isArray(merged[filter.key]) &&
              merged[filter.key].length === 0
            ) {
              delete merged[filter.key];
            }
            if (
              filter.sub?.key &&
              Array.isArray(merged[filter.sub.key]) &&
              merged[filter.sub.key].length === 0
            ) {
              delete merged[filter.sub.key];
            }
            applyDraft?.(merged);
            onClose();
          }}
          className="enhanced-btn-confirm"
        >
          Apply Filters
          {valuesMain.length + valuesSub.length > 0 && (
            <span className="confirm-badge">
              {valuesMain.length + valuesSub.length}
            </span>
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .filter-panel {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-panel.enter {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .x-btn {
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .x-btn:hover {
          background: #f1f5f9;
          transform: rotate(90deg);
        }

        .rot {
          transform: rotate(180deg);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .enhanced-select-trigger {
          width: 100%;
          text-align: left;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          alignItems: center;
          justify-content: space-between;
          background: #fff;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .enhanced-select-trigger:hover {
          border-color: var(--tp-theme-primary);
          box-shadow: 0 0 0 3px rgba(44, 76, 151, 0.12);
        }

        .enhanced-btn-confirm {
          margin-left: auto;
          height: 48px;
          min-width: 140px;
          padding: 0 20px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(
            135deg,
            var(--tp-theme-primary),
            #1e326b
          );
          color: #fff;
          font: 600 15px "Inter", system-ui;
          box-shadow: 0 8px 20px rgba(44, 76, 151, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .enhanced-btn-confirm::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.25),
            transparent
          );
          transition: left 0.6s ease;
        }

        .enhanced-btn-confirm:hover::before {
          left: 100%;
        }

        .enhanced-btn-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(44, 76, 151, 0.45);
        }

        .enhanced-btn-confirm:active {
          transform: translateY(0);
        }

        .confirm-badge {
          background: rgba(255, 255, 255, 0.22);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .enhanced-link-clear {
          border: 2px solid transparent;
          background: transparent;
          color: #64748b;
          font: 600 14px "Inter", system-ui;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .enhanced-link-clear:hover:not(:disabled) {
          color: #ef4444;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .enhanced-link-clear:disabled {
          color: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );

  const portalNode = portalTarget ?? document.body;

  return createPortal(
    <>
      {Backdrop}
      {Panel}
    </>,
    portalNode
  );
}

/* ---------- Dropdown Portal ---------- */
function EnhancedDropdownPortal({ anchorRef, maxHeight, children, portalTarget }) {
  const [rect, setRect] = useState(null);
  const [containerRect, setContainerRect] = useState(null);
  const container = portalTarget ?? document.body;

  useEffect(() => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (r) setRect(r);
    if (container && container.getBoundingClientRect) {
      setContainerRect(container.getBoundingClientRect());
    }
  }, [anchorRef, container]);

  if (!rect) return null;

  const useRelative = !!portalTarget && containerRect;
  const left = useRelative ? rect.left - containerRect.left : rect.left;
  const top = useRelative ? rect.bottom - containerRect.top + 8 : rect.bottom + 8;

  const style = {
    position: useRelative ? "absolute" : "fixed",
    left,
    top,
    width: rect.width,
    zIndex: 9999,
    background: "#fff",
    border: "1px solid rgba(15,23,42,.08)",
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.08)",
    backdropFilter: "none", // no blur
  };

  return createPortal(
    <div
      role="listbox"
      aria-multiselectable="true"
      className="enhanced-dd-surface"
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="enhanced-dd-scroll"
        style={{ maxHeight, overflow: "auto", padding: "8px" }}
      >
        {children}
      </div>
      <style jsx global>{`
        .enhanced-dd-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .enhanced-dd-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .enhanced-dd-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .enhanced-dd-surface {
          animation: enhancedDdIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top center;
        }

        @keyframes enhancedDdIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    container
  );
}

/* ---------- Menu Content ---------- */
function EnhancedMenuContent({ options, isLoading, error, values, onPick }) {
  if (isLoading)
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
        <div style={{ animation: "pulse 2s infinite", fontSize: 14 }}>
          Loading options...
        </div>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#ef4444" }}>
        <div>⚠️ Failed to load</div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
          Please try again
        </div>
      </div>
    );

  if (!options?.length)
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
        <div>No options available</div>
      </div>
    );

  return (
    <>
      {options.map((o) => {
        const { value, name } = getNameAndValue(o);
        const checked = values.includes(value);
        return (
          <label
            key={value}
            className="enhanced-dd-item"
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(value);
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="enhanced-cbx"
            />
            <span className="enhanced-dd-label">{name}</span>

            <style jsx>{`
              .enhanced-dd-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin: 2px 0;
              }

              .enhanced-dd-item:hover {
                background: #f8fafc;
                transform: translateX(2px);
              }

              .enhanced-cbx {
                appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                background: #fff;
                position: relative;
                display: inline-block;
                vertical-align: middle;
                transition: all 0.2s ease;
                cursor: pointer;
              }

              .enhanced-cbx:checked {
                background: var(--tp-theme-primary);
                border-color: var(--tp-theme-primary);
              }

              .enhanced-cbx::after {
                content: "";
                position: absolute;
                left: 6px;
                top: 2px;
                width: 6px;
                height: 12px;
                border: 2px solid #fff;
                border-top: 0;
                border-left: 0;
                transform: rotate(45deg);
                transition: all 0.2s ease;
              }

              .enhanced-cbx:not(:checked)::after {
                opacity: 0;
                transform: rotate(45deg) scale(0.5);
              }

              .enhanced-dd-label {
                font: 500 14px/1.4 "Inter", system-ui;
                color: #0f172a;
                flex: 1;
              }
            `}</style>
          </label>
        );
      })}
    </>
  );
}

/* ---------- Icons ---------- */
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EnhancedChevronDown({ className = "" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =======================================================
   Single-filter helper
======================================================= */
export function FilterOnly({
  filter,
  selected,
  onApply,
  onCancel,
  portalTarget,
}) {
  const h =
    typeof window !== "undefined"
      ? Math.round(window.innerHeight * 0.72)
      : 600;

  return (
    <EnhancedFilterFlyout
      anchorLeft={0}
      anchorTop={0}
      maxHeight={h}
      filter={filter}
      selected={selected}
      onClear={() => {
        const n = { ...selected };
        delete n[filter.key];
        if (filter.sub?.key) delete n[filter.sub.key];
        onApply(n);
      }}
      onClose={onCancel}
      applyDraft={(next) => onApply(next)}
      centered
      portalTarget={portalTarget}
    />
  );
}
