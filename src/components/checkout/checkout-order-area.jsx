'use client';
import React, { useState } from "react";
import { useSelector } from "react-redux";
import useCartInfo from "@/hooks/use-cart-info";

const CheckoutOrderArea = ({ 
  checkoutData, 
  handleSubmitOrder, 
  isLoading = false 
}) => {
  const {
    handleShippingCost,
    cartTotal = 0,
    shippingCost = 0,
    discountAmount = 0
  } = checkoutData || {};

  const { cart_products } = useSelector((state) => state.cart);
  const { total } = useCartInfo();
  
  const [shippingMethod, setShippingMethod] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState('online');

  const handleShippingChange = (e) => {
    const value = e.target.value;
    setShippingMethod(value);
    const cost = value === 'free' ? 0 : value === 'flat' ? 15 : 8;
    if (handleShippingCost) {
      handleShippingCost(cost);
    }
  };

  const finalTotal = (total || cartTotal) + (shippingCost || 0) - (discountAmount || 0);

  return (
    <>
      <div className="modern-order-area">
        <div className="order-header">
          <h2 className="order-title">Order Summary</h2>
          <p className="order-subtitle">{cart_products?.length || 0} item{(cart_products?.length || 0) !== 1 ? 's' : ''} in your order</p>
        </div>

        {/* Products List */}
        <div className="order-products-section">
          <h3 className="section-title">Your Items</h3>
          <div className="products-list">
            {cart_products?.map((item, index) => {
              const name = item?.title || item?.name || 'Product';
              const qty = Number(item?.orderQuantity || item?.quantity || 1);
              const price = Number(item?.price || 0);
              const img = item?.img || item?.image || '/images/placeholder.png';
              
              return (
                <div className="product-card" key={item?._id || index}>
                  <div className="product-image">
                    <img src={img} alt={name} />
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{name}</h4>
                    <span className="product-quantity">Quantity: {qty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Options */}
        <div className="shipping-section">
          <h3 className="section-title">Shipping Options</h3>
          <div className="shipping-options">
            <label className="shipping-option">
              <input 
                type="radio" 
                name="shipping" 
                value="free" 
                checked={shippingMethod === 'free'} 
                onChange={handleShippingChange} 
              />
              <div className="option-info">
                <div className="option-main">
                  <span className="option-title">Free Delivery</span>
                  <span className="option-price">$0.00</span>
                </div>
                <span className="option-desc">Delivered today</span>
              </div>
            </label>
            <label className="shipping-option">
              <input 
                type="radio" 
                name="shipping" 
                value="flat" 
                checked={shippingMethod === 'flat'} 
                onChange={handleShippingChange} 
              />
              <div className="option-info">
                <div className="option-main">
                  <span className="option-title">Standard Delivery</span>
                  <span className="option-price">$15.00</span>
                </div>
                <span className="option-desc">Delivered in 7 days</span>
              </div>
            </label>
            <label className="shipping-option">
              <input 
                type="radio" 
                name="shipping" 
                value="local" 
                checked={shippingMethod === 'local'} 
                onChange={handleShippingChange} 
              />
              <div className="option-info">
                <div className="option-main">
                  <span className="option-title">Local Pickup</span>
                  <span className="option-price">$8.00</span>
                </div>
                <span className="option-desc">Pickup from store</span>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="payment-section">
          <h3 className="section-title">Payment Method</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input 
                type="radio" 
                name="payment" 
                value="online" 
                checked={paymentMethod === 'online'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              <div className="option-info">
                <div className="option-main">
                  <span className="option-title">Credit Card</span>
                  <div className="payment-icons">
                    <span className="payment-icon">💳</span>
                  </div>
                </div>
                <span className="option-desc">Pay securely with your card</span>
              </div>
            </label>
            <label className="payment-option">
              <input 
                type="radio" 
                name="payment" 
                value="cod" 
                checked={paymentMethod === 'cod'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              <div className="option-info">
                <div className="option-main">
                  <span className="option-title">Cash on Delivery</span>
                  <div className="payment-icons">
                    <span className="payment-icon">💵</span>
                  </div>
                </div>
                <span className="option-desc">Pay when you receive your order</span>
              </div>
            </label>
          </div>
        </div>

        {/* Order Total & Place Order */}
        <div className="order-action">
          <div className="total-display">
            <span className="total-label">Total Amount</span>
            <span className="total-amount">${finalTotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="place-order-button"
            onClick={handleSubmitOrder}
            disabled={isLoading || !cart_products?.length}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Processing Order...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>

      {/* Modern Styles */}
      <style jsx>{`
        .modern-order-area {
          background: var(--tp-common-white);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          height: fit-content;
        }

        .order-header {
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--tp-grey-2);
        }

        .order-title {
          font-size: 20px !important;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 8px;
        }

        .order-subtitle {
          color: var(--tp-text-2);
          margin: 0;
          font-size: 14px !important;
        }

        /* Products Section */
        .order-products-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 14px !important;
          font-weight: 600;
          color: var(--tp-text-1);
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--tp-grey-2);
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--tp-common-white);
          border-radius: 8px;
          border: 1px solid var(--tp-grey-2);
          transition: all 0.2s ease;
        }

        .product-card:hover {
          border-color: var(--tp-theme-primary);
          box-shadow: 0 2px 8px rgba(9, 137, 255, 0.1);
        }

        .product-image {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--tp-grey-2);
          background: var(--tp-grey-1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 13px !important;
          font-weight: 500;
          color: var(--tp-text-1);
          margin-bottom: 2px;
          line-height: 1.3;
        }

        .product-quantity {
          font-size: 11px !important;
          color: var(--tp-text-2);
        }

        /* Shipping & Payment Sections */
        .shipping-section,
        .payment-section {
          margin-bottom: 24px;
        }

        .shipping-options,
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .shipping-option,
        .payment-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 2px solid var(--tp-grey-2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--tp-common-white);
        }

        .shipping-option:hover,
        .payment-option:hover {
          border-color: var(--tp-theme-primary);
          background: rgba(9, 137, 255, 0.02);
        }

        .shipping-option:has(input:checked),
        .payment-option:has(input:checked) {
          border-color: var(--tp-theme-primary);
          background: rgba(9, 137, 255, 0.05);
        }

        .shipping-option input[type="radio"],
        .payment-option input[type="radio"] {
          margin-top: 2px;
          accent-color: var(--tp-theme-primary);
          cursor: pointer;
        }

        .option-info {
          flex: 1;
        }

        .option-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .option-title {
          font-weight: 600;
          color: var(--tp-text-1);
          font-size: 13px !important;
        }

        .option-price {
          font-weight: 700;
          color: var(--tp-theme-primary);
          font-size: 13px !important;
        }

        .option-desc {
          font-size: 11px !important;
          color: var(--tp-text-2);
        }

        .payment-icons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .payment-icon {
          font-size: 16px;
        }

        /* Order Action Section */
        .order-action {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid var(--tp-grey-2);
        }

        .total-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: var(--tp-grey-1);
          border-radius: 8px;
          border: 1px solid var(--tp-grey-2);
        }

        .total-label {
          font-size: 16px !important;
          font-weight: 600;
          color: var(--tp-text-1);
        }

        .total-amount {
          font-size: 20px !important;
          font-weight: 800;
          color: var(--tp-theme-primary);
        }

        .place-order-button {
          width: 100%;
          background: linear-gradient(135deg, var(--tp-theme-primary) 0%, color-mix(in srgb, var(--tp-theme-primary) 85%, black) 100%);
          color: var(--tp-common-white);
          border: none;
          border-radius: 8px;
          padding: 16px 24px;
          font-size: 16px !important;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 50px;
          box-shadow: 0 4px 12px rgba(9, 137, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .place-order-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .place-order-button:hover::before {
          left: 100%;
        }

        .place-order-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(9, 137, 255, 0.3);
        }

        .place-order-button:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(9, 137, 255, 0.2);
        }

        .place-order-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 12px rgba(9, 137, 255, 0.1);
        }

        .place-order-button:disabled::before {
          display: none;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid var(--tp-common-white);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-order-area {
            padding: 24px 20px;
            border-radius: 12px;
          }

          .order-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
          }

          .order-title {
            font-size: 18px !important;
          }

          .order-products-section,
          .shipping-section,
          .payment-section {
            margin-bottom: 20px;
          }

          .place-order-button {
            padding: 14px 20px;
            font-size: 15px !important;
          }
        }

        @media (max-width: 480px) {
          .modern-order-area {
            padding: 20px 16px;
          }

          .order-title {
            font-size: 16px !important;
          }

          .order-subtitle {
            font-size: 13px !important;
          }

          .section-title {
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutOrderArea;
