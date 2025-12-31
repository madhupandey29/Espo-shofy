'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useCartInfo from "@/hooks/use-cart-info";

const CartCheckout = () => {
  const { total, quantity } = useCartInfo();
  const [shipCost, setShipCost] = useState(0);
  const router = useRouter();
  
  // Don't show checkout if no items
  if (quantity === 0) {
    return (
      <div className="tp-cart-checkout-wrapper">
        <div className="text-center py-4">
          <p>Your cart is empty</p>
          <button
            type="button"
            className="btn-ghost-invert w-100"
            onClick={() => router.push('/shop')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // handle shipping cost
  const handleShippingCost = (value) => {
    if (value === "free") setShipCost(0);
    else setShipCost(Number(value));
  };

  const handleProceed = () => {
    router.push("/checkout");
  };

  return (
    <>
      <div className="tp-cart-checkout-wrapper">
        <div className="tp-cart-checkout-top d-flex align-items-center justify-content-between">
          <span className="tp-cart-checkout-top-title">Subtotal</span>
          <span className="tp-cart-checkout-top-price">${total}</span>
        </div>

        <div className="tp-cart-checkout-shipping">
          <h4 className="tp-cart-checkout-shipping-title">Shipping</h4>
          <div className="tp-cart-checkout-shipping-option-wrapper">
            <div className="tp-cart-checkout-shipping-option">
              <input id="flat_rate" type="radio" name="shipping" />
              <label htmlFor="flat_rate" onClick={() => handleShippingCost(20)}>
                Flat rate: <span>$20.00</span>
              </label>
            </div>
            <div className="tp-cart-checkout-shipping-option">
              <input id="local_pickup" type="radio" name="shipping" />
              <label htmlFor="local_pickup" onClick={() => handleShippingCost(25)}>
                Local pickup: <span>$25.00</span>
              </label>
            </div>
            <div className="tp-cart-checkout-shipping-option">
              <input id="free_shipping" type="radio" name="shipping" />
              <label htmlFor="free_shipping" onClick={() => handleShippingCost("free")}>
                Free shipping
              </label>
            </div>
          </div>
        </div>

        <div className="tp-cart-checkout-total d-flex align-items-center justify-content-between">
          <span>Total</span>
          <span>${(total + shipCost).toFixed(2)}</span>
        </div>

        <div className="tp-cart-checkout-proceed">
          <button
            type="button"
            className="btn-ghost-invert w-100"
            onClick={handleProceed}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* ===== Internal Styles (Scoped) ===== */}
      <style jsx>{`
        .tp-cart-checkout-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        .tp-cart-checkout-top,
        .tp-cart-checkout-total {
          font-weight: 600;
          font-size: 16px;
          color: #111827;
          margin-bottom: 16px;
        }

        .tp-cart-checkout-shipping-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #111827;
        }

        .tp-cart-checkout-shipping-option {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .tp-cart-checkout-shipping-option label {
          cursor: pointer;
          color: #374151;
          font-size: 15px;
        }

        .tp-cart-checkout-shipping-option label span {
          font-weight: 500;
        }

        /* === Proceed to Checkout — ghost-invert, square === */
        .btn-ghost-invert {
          --navy: #0b1620;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 12px 22px;
          width: 100%;
          font-weight: 600;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          user-select: none;
          border-radius: 0;
          background: var(--navy);
          color: #ffffff;
          border: 1px solid var(--navy);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
          transition:
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            transform 120ms ease,
            box-shadow 180ms ease;
        }

        .btn-ghost-invert:hover {
          background: #ffffff;
          color: var(--navy);
          border-color: var(--navy);
          box-shadow: 0 0 0 1px var(--navy) inset, 0 8px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }

        .btn-ghost-invert:active {
          transform: translateY(0);
          background: #f8fafc;
          color: var(--navy);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
        }

        .btn-ghost-invert:focus-visible {
          outline: 0;
          box-shadow: 0 0 0 3px rgba(11, 22, 32, 0.35);
        }

        @media (max-width: 640px) {
          .tp-cart-checkout-wrapper {
            padding: 18px;
          }
          .btn-ghost-invert {
            min-height: 44px;
            padding: 10px 18px;
            font-size: 15px;
          }
        }
      `}</style>
    </>
  );
};

export default CartCheckout;
