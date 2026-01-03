'use client';

import React from 'react';

const labelMap = {
  category: 'Category',
  brand: 'Brand',
  color: 'Color',
  content: 'Content',
  design: 'Design',
  structure: 'Structure',
  finish: 'Finish',
  motif: 'Motif',
  price: 'Price',
};

const ShopTopLeft = ({ total = 0, chips = [], onRemoveChip, onClearAll }) => {
  return (
    <div className="shopTopLeftWrap">
      <div className="shopTopLeftRow">
        <div className="shopCount">
          <strong>{total}</strong> Products
        </div>

        {chips.length > 0 && (
          <button type="button" className="chipClearAll" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="chipsRow">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              onClick={() => onRemoveChip?.(c)}
              title="Remove filter"
            >
              <span className="chipText">
                {labelMap[c.key] || c.key}: {c.value}
              </span>
              <span className="chipX" aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .shopTopLeftWrap{ display:flex; flex-direction:column; gap:10px; }
        .shopTopLeftRow{
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .shopCount{
          font: 700 14px/1 var(--tp-ff-roboto);
          color: var(--tp-text-1);
          letter-spacing: .2px;
        }
        .shopCount strong{
          font-size: 16px;
          color: var(--tp-text-1);
        }
        .chipClearAll{
          border:0;
          background:transparent;
          color: var(--tp-theme-primary);
          font: 800 12px/1 var(--tp-ff-roboto);
          cursor:pointer;
        }

        .chipsRow{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }
        .chip{
          display:inline-flex;
          align-items:center;
          gap:10px;
          border:1px solid var(--tp-grey-2);
          background: var(--tp-grey-1);
          color: var(--tp-text-1);
          border-radius:999px;
          padding:8px 10px;
          cursor:pointer;
          max-width: 100%;
        }
        .chipText{
          font: 600 12px/1 var(--tp-ff-roboto);
          white-space: nowrap;
          overflow:hidden;
          text-overflow: ellipsis;
          max-width: 260px;
        }
        .chipX{
          width:18px; height:18px;
          display:inline-grid; place-items:center;
          border-radius:50%;
          background: #fff;
          border: 1px solid var(--tp-grey-2);
          font-weight:900;
          line-height: 18px;
        }
        .chip:hover{
          border-color: var(--tp-theme-primary);
          background: #fff;
        }

        @media (max-width: 768px){
          .chipText{ max-width: 180px; }
        }
      `}</style>
    </div>
  );
};

export default ShopTopLeft;
