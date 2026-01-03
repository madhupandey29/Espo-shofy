import React, { useState, useEffect } from "react";
import { useGetFieldValuesQuery } from "@/redux/api/apiSlice";

/**
 * Mobile Filter Only Component for New API
 */
const FilterOnly = ({
  filter,
  selected,
  onApply,
  onCancel,
}) => {
  const [draft, setDraft] = useState(() => {
    const obj = {};
    obj[filter.key] = (Array.isArray(selected[filter.key])
      ? selected[filter.key]
      : []
    ).map(String);
    return obj;
  });

  // Fetch field values using new API
  const { data: fieldData, isLoading, error } = useGetFieldValuesQuery(filter.key, {
    skip: !filter,
  });

  // Debug logging for mobile
  useEffect(() => {
    console.log('Mobile FilterOnly - Filter:', filter);
    console.log('Mobile FilterOnly - API call for field:', filter?.key);
    console.log('Mobile FilterOnly - Loading:', isLoading);
    console.log('Mobile FilterOnly - Error:', error);
    console.log('Mobile FilterOnly - Data:', fieldData);
  }, [filter, isLoading, error, fieldData]);

  const toggleDraft = (key, rawValue) => {
    const value = String(rawValue);
    setDraft((d) => {
      const cur = new Set(d[key] || []);
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      return { ...d, [key]: [...cur] };
    });
  };

  const values = draft[filter.key] || [];
  const fieldValues = fieldData?.values || [];

  const handleApply = () => {
    const merged = { ...selected, ...draft };
    if (
      Array.isArray(merged[filter.key]) &&
      merged[filter.key].length === 0
    ) {
      delete merged[filter.key];
    }
    onApply?.(merged);
    // Note: onApply should handle closing the modal in the parent component
  };

  const handleClear = () => {
    const next = { ...selected };
    delete next[filter.key];
    onApply?.(next);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, system-ui",
      }}
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
          {values.length > 0 && (
            <div
              style={{
                fontWeight: 500,
                fontSize: 13,
                color: "#64748b",
                marginTop: 2,
              }}
            >
              {values.length} selected
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 24px",
        }}
      >
        {isLoading && (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
            <div style={{ animation: "pulse 2s infinite", fontSize: 14 }}>
              Loading options...
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: 20, textAlign: "center", color: "#ef4444" }}>
            <div>⚠️ Failed to load</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
              Please try again
            </div>
          </div>
        )}

        {!isLoading && !error && !fieldValues?.length && (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
            <div>No options available</div>
          </div>
        )}

        {!isLoading && !error && fieldValues?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fieldValues.map((value) => {
              const checked = values.includes(String(value));
              return (
                <label
                  key={value}
                  className="mobile-filter-item"
                  onClick={() => toggleDraft(filter.key, value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 18px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    style={{
                      appearance: "none",
                      width: "22px",
                      height: "22px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      background: checked ? "var(--tp-theme-primary)" : "#fff",
                      borderColor: checked ? "var(--tp-theme-primary)" : "#e2e8f0",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{
                    font: "500 16px/1.4 Inter, system-ui",
                    color: "#0f172a",
                    flex: 1,
                  }}>
                    {value}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "20px 24px",
          borderTop: "1px solid rgba(15,23,42,.06)",
          display: "flex",
          gap: 12,
          background: "#fff",
        }}
      >
        <button
          type="button"
          onClick={handleClear}
          disabled={values.length === 0}
          style={{
            border: "2px solid transparent",
            background: "transparent",
            color: values.length === 0 ? "#cbd5e1" : "#64748b",
            font: "600 14px Inter, system-ui",
            padding: "12px 16px",
            borderRadius: "12px",
            cursor: values.length === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            border: "2px solid #e2e8f0",
            background: "#fff",
            color: "#64748b",
            font: "600 14px Inter, system-ui",
            padding: "12px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          style={{
            marginLeft: "auto",
            height: "48px",
            minWidth: "120px",
            padding: "0 20px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, var(--tp-theme-primary), #1e326b)",
            color: "#fff",
            font: "600 15px Inter, system-ui",
            boxShadow: "0 8px 20px rgba(44, 76, 151, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Apply
          {values.length > 0 && (
            <span style={{
              background: "rgba(255, 255, 255, 0.22)",
              padding: "2px 8px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
            }}>
              {values.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export { FilterOnly };
export default FilterOnly;