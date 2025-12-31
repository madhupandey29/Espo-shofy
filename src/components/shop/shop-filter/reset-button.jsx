'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const ResetButton = ({
  shop_right = false,
  setPriceValues,
  maxPrice,
  handleFilterChange,
}) => {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const handleReset = async () => {
    if (busy) return;
    setBusy(true);

    try {
      if (typeof setPriceValues === 'function') {
        setPriceValues([0, maxPrice]);
      }
      if (typeof handleFilterChange === 'function') {
        handleFilterChange({});
      }
      router.push(`/${shop_right ? 'shop-right-sidebar' : 'shop'}`);
    } finally {
      setTimeout(() => setBusy(false), 250);
    }
  };

  return (
    <>
      <div className="tp-shop-widget mb-20">
        <button
          onClick={handleReset}
          className="tp-btn tp-btn-reset"
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? 'Resetting…' : 'Reset Filter'}
        </button>
      </div>

      {/* Inline scoped styles */}
      <style jsx>{`
        .tp-btn-reset {
          width: 100%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          background-color: var(--tp-theme-primary, #2C4C97);
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          border: none;
          border-radius: 6px;
          padding: 12px 20px;
          transition: all 0.25s ease;
          box-shadow: 0 2px 6px rgba(44, 76, 151, 0.25);
        }

        .tp-btn-reset:hover {
          background-color: var(--tp-theme-hover, #1e3570);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(44, 76, 151, 0.35);
        }

        .tp-btn-reset:active {
          transform: translateY(0);
          box-shadow: 0 1px 3px rgba(44, 76, 151, 0.3);
        }

        .tp-btn-reset:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .tp-btn-reset {
            font-size: 14px;
            padding: 10px 16px;
          }
        }
      `}</style>
    </>
  );
};

export default ResetButton;
