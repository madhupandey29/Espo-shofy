'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import CartItem from './cart-item';
import { selectUserId } from '@/utils/userSelectors';
import {
  useGetCartDataQuery,
  useClearCartMutation,
} from '@/redux/features/cartApi';

const CartArea = () => {
  const userId = useSelector(selectUserId);
  const router = useRouter();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);

  const {
    data: cartResponse,
    isLoading,
    error,
    refetch,
  } = useGetCartDataQuery(userId, { skip: !userId });

  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const cart_products =
    cartResponse?.data?.items
      ?.map((item) =>
        item?.productId
          ? {
              ...(item.productId || {}),
              title: item.productId?.name,
              _id: item.productId?._id,
              orderQuantity: item.quantity,
              cartItemId: item._id,
            }
          : null
      )
      .filter(Boolean) || [];

  const handleAddProduct = () => router.push('/shop');

  const handleClearCart = async () => {
    if (!userId || isClearing) return;
    try {
      // IMPORTANT: pass userId so RTKQ invalidation hits the right tag
      await clearCart({ userId }).unwrap();
      // Either rely on invalidation, or force a refetch for instant UI sync:
      refetch();
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
  };

  // ✅ Proceed only navigates – no API calls here
  const handleCheckout = async () => {
    if (isProceeding) return;
    setIsProceeding(true);
    try {
      router.push('/checkout');
    } finally {
      setIsProceeding(false);
    }
  };

  // Hide sticky bar when footer is in view
  useEffect(() => {
    const footerEl = document.querySelector('footer');
    if (!footerEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsFooterVisible(entry.isIntersecting));
      },
      { threshold: 0.1 }
    );
    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  if (!userId) {
    return (
      <section className="tp-cart-area pb-120">
        <div className="container">
          <div className="text-center pt-50">
            <h3>Please sign in to view your cart</h3>
            <button
              type="button"
              className="btn-ghost-invert square mt-20"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="tp-cart-area pb-120">
        <div className="container">
          <div className="text-center pt-50">
            <h3>Loading cart…</h3>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tp-cart-area pb-120">
        <div className="container">
          <div className="text-center pt-50">
            <h3>Error loading cart</h3>
            <p>Please try again.</p>
            <button
              type="button"
              className="btn-ghost-invert square mt-20"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="myntra-cart-area">
        <div className="container">
          {cart_products.length === 0 && (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet</p>
              <button
                type="button"
                className="btn-start-shopping"
                onClick={handleAddProduct}
              >
                Start Shopping
              </button>
            </div>
          )}

          {cart_products.length > 0 && (
            <>
              <div className="cart-header">
                <h2>Shopping Cart</h2>
                <p className="cart-count">{cart_products.length} item{cart_products.length !== 1 ? 's' : ''} in your cart</p>
              </div>

              <div className="cart-items-list">
                {cart_products.map((item, i) => (
                  <CartItem key={item.cartItemId || item._id || i} product={item} />
                ))}
              </div>

              <div className="cart-actions">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="btn-continue-shopping"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="btn-proceed-checkout"
                  disabled={isProceeding}
                >
                  {isProceeding ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar */}
      {cart_products.length > 0 && (
        <div className={`mobile-cart-sticky ${isFooterVisible ? 'hide' : ''}`}>
          <div className="mobile-actions-row">
            <button
              type="button"
              onClick={handleAddProduct}
              className="btn-mobile-continue"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="btn-mobile-checkout"
              disabled={isProceeding}
            >
              {isProceeding ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .myntra-cart-area {
          padding: 40px 0 120px;
          background: var(--tp-grey-1);
          min-height: 100vh;
        }

        .empty-cart-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--tp-common-white);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          max-width: 500px;
          margin: 0 auto;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .empty-cart-icon {
          color: var(--tp-grey-8);
          margin-bottom: 24px;
        }

        .empty-cart-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 12px;
        }

        .empty-cart-state p {
          color: var(--tp-text-2);
          margin-bottom: 32px;
          font-size: 16px;
        }

        .btn-start-shopping {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-start-shopping:hover {
          background: color-mix(in srgb, var(--tp-theme-primary) 90%, black);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(44, 76, 151, 0.3);
        }

        .cart-header {
          background: var(--tp-common-white);
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .cart-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 4px;
        }

        .cart-count {
          color: var(--tp-text-2);
          font-size: 16px;
          margin: 0;
        }

        .cart-items-list {
          background: var(--tp-common-white);
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .cart-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .btn-continue-shopping {
          flex: 1;
          background: transparent;
          color: var(--tp-theme-primary);
          border: 2px solid var(--tp-theme-primary);
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-continue-shopping:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
        }

        .btn-proceed-checkout {
          flex: 1;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-proceed-checkout:hover {
          background: color-mix(in srgb, var(--tp-theme-primary) 90%, black);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(44, 76, 151, 0.3);
        }

        .btn-proceed-checkout:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .mobile-cart-sticky {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--tp-common-white);
          border-top: 1px solid var(--tp-grey-2);
          padding: 16px;
          z-index: 1000;
          transition: transform 0.3s ease;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        }

        .mobile-cart-sticky.hide {
          transform: translateY(100%);
        }

        .mobile-actions-row {
          display: flex;
          gap: 12px;
        }

        .btn-mobile-continue {
          flex: 1;
          background: transparent;
          color: var(--tp-theme-primary);
          border: 2px solid var(--tp-theme-primary);
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-mobile-continue:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
        }

        .btn-mobile-checkout {
          flex: 1;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: none;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-mobile-checkout:hover {
          background: color-mix(in srgb, var(--tp-theme-primary) 90%, black);
        }

        .btn-mobile-checkout:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .myntra-cart-area {
            padding: 20px 0 100px;
            min-height: 100vh;
            display: flex;
            align-items: center;
          }

          .empty-cart-state {
            padding: 60px 20px;
            margin: 0 16px;
            min-height: 350px;
            width: calc(100% - 32px);
            max-width: none;
          }

          .cart-header {
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 12px;
          }

          .cart-header h2 {
            font-size: 24px;
          }

          .cart-items-list {
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .cart-actions {
            display: none;
          }

          .mobile-cart-sticky {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .myntra-cart-area {
            padding: 16px 0 100px;
            min-height: 100vh;
            display: flex;
            align-items: center;
          }

          .empty-cart-state {
            padding: 40px 16px;
            margin: 0 12px;
            min-height: 320px;
            border-radius: 12px;
          }

          .empty-cart-state h3 {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .empty-cart-state p {
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
          }

          .btn-start-shopping {
            padding: 14px 28px;
            font-size: 14px;
          }

          .cart-header {
            padding: 16px;
            margin-bottom: 8px;
          }

          .cart-header h2 {
            font-size: 20px;
          }

          .cart-count {
            font-size: 14px;
          }

          .cart-items-list {
            margin-bottom: 16px;
          }

          .mobile-cart-sticky {
            padding: 12px;
          }

          .btn-mobile-continue,
          .btn-mobile-checkout {
            padding: 12px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

export default CartArea;
