'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import WishlistItem from './wishlist-item';
import { Plus } from '@/svg';
import useWishlistManager from '@/hooks/useWishlistManager';

const WishlistArea = () => {
  const router = useRouter();

  const { userId, wishlist, loading } = useWishlistManager();

  /* --------------------------- actions --------------------------- */
  const handleAddProduct = () => router.push('/shop');
  const handleGoToCart = () => router.push('/cart');
  const handleContinueShopping = () => router.push('/shop');

  const hasItems = Array.isArray(wishlist) && wishlist.length > 0;

  return (
    <>
      <section className="modern-wishlist-area">
        <div className="container">
          {!hasItems && !loading && (
            <div className="empty-wishlist-state">
              <div className="empty-wishlist-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Save items you love to your wishlist and shop them later</p>
              <button
                type="button"
                onClick={handleContinueShopping}
                className="btn-primary-modern"
                aria-label="Continue Shopping"
              >
                Start Shopping
              </button>
            </div>
          )}

          {hasItems && (
            <div className="wishlist-content">
              <div className="wishlist-header">
                <div className="header-info">
                  <h2>My Wishlist</h2>
                  <p>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
                </div>
                <div className="header-actions">
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="btn-continue-shopping-header"
                    title="Browse more products"
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToCart}
                    className="btn-view-cart"
                    title="View your cart"
                  >
                    View Cart
                  </button>
                </div>
              </div>

              <div className="wishlist-grid">
                {wishlist.map((item, i) => (
                  <WishlistItem key={(item?._id || item?.id || i) + '_wl'} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        .modern-wishlist-area {
          padding: 40px 0 80px;
          background: var(--tp-grey-1);
          min-height: calc(100vh - 200px);
        }

        .empty-wishlist-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--tp-common-white);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          max-width: 500px;
          margin: 0 auto;
        }

        .empty-wishlist-icon {
          color: var(--tp-grey-8);
          margin-bottom: 24px;
        }

        .empty-wishlist-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 12px;
        }

        .empty-wishlist-state p {
          color: var(--tp-text-2);
          margin-bottom: 32px;
          font-size: 16px;
        }

        .wishlist-content {
          background: var(--tp-common-white);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .wishlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--tp-grey-2);
          background: var(--tp-common-white);
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-info h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 4px;
        }

        .header-info p {
          color: var(--tp-text-2);
          font-size: 16px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-continue-shopping-header {
          background: transparent;
          color: var(--tp-theme-primary);
          border: 2px solid var(--tp-theme-primary);
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-continue-shopping-header:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
        }

        .btn-view-cart {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-view-cart:hover {
          background: color-mix(in srgb, var(--tp-theme-primary) 90%, black);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(44, 76, 151, 0.3);
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          padding: 24px;
        }

        .btn-primary-modern {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary-modern:hover {
          background: color-mix(in srgb, var(--tp-theme-primary) 90%, black);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(44, 76, 151, 0.3);
        }

        .btn-icon {
          display: inline-flex;
          align-items: center;
          line-height: 0;
        }

        /* Responsive Design */
        @media (max-width: 1400px) {
          .wishlist-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }

        @media (max-width: 768px) {
          .modern-wishlist-area {
            padding: 20px 0 60px;
          }

          .wishlist-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .header-info h2 {
            font-size: 24px;
          }

          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .empty-wishlist-state {
            padding: 40px 16px;
            margin: 0 16px;
          }

          .wishlist-header {
            padding: 16px;
          }

          .header-info h2 {
            font-size: 20px;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
            flex-direction: row;
            gap: 8px;
          }

          .btn-continue-shopping-header,
          .btn-view-cart {
            flex: 1;
            justify-content: center;
            padding: 10px 12px;
            font-size: 12px;
          }

          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
            padding: 16px;
            gap: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default WishlistArea;
