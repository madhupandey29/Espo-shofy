'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import { useGetCartDataQuery } from '@/redux/features/cartApi';
import { selectUserId } from '@/utils/userSelectors';
import { useCreateOrderMutation } from '@/redux/features/order/orderApi';

/* ---------- helpers ---------- */
const getErrorMessage = (err) => {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const m = err.message;
    if (typeof m === 'string') return m;
  }
  return 'Please try again later';
};

// Fallback: get userId from localStorage when needed
const getLocalUserId = () => {
  try {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('userId');
      return id && id.trim() ? id.trim() : null;
    }
  } catch(err) {console.log("err:",err)}
  return null;
};

// Clear entire cart for a user on server (DELETE with POST fallback)
const clearCartOnServer = async (uid) => {
  if (!uid) return;
  const url = `https://test.amrita-fashions.com/shopy/cart/clear/${uid}`;
  try {
    let res = await fetch(url, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok && (res.status === 405 || res.status === 404)) {
      res = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.warn('Clear cart failed:', res.status, t);
    }
  } catch (err) {
    console.warn('Clear cart request error:', err);
  }
};

const CheckoutArea = () => {
  const router = useRouter();
  const reduxUserId = useSelector(selectUserId) ?? null;
  const localUserId = typeof window !== 'undefined' ? getLocalUserId() : null;
  const userId = reduxUserId || localUserId || null;

  // Mutations
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();

  // UI / form state
  const [activeStep] = useState(2); // 1: cart, 2: checkout, 3: complete
  const [shippingMethod, setShippingMethod] = useState('free'); // 'free' | 'flat' | 'local'
  const [shippingCost, setShippingCost] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: 'United States (US)',
    streetAddress: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    orderNotes: '',
    paymentUI: 'online', // 'online' | 'cod'
  });

  // Fetch cart data
  const { data: cartDataRaw, isLoading, error, refetch } = useGetCartDataQuery(userId, {
    skip: !userId,
  });

  // Normalize cart items
  const cart_products = useMemo(() => cartDataRaw?.data?.items ?? [], [cartDataRaw]);

  // Subtotal from cart
  const subtotal = useMemo(() => {
    return cart_products.reduce((sum, item) => {
      const price = Number(item?.productId?.price ?? 0);
      const qty = Number(item?.quantity ?? 1);
      return sum + price * qty;
    }, 0);
  }, [cart_products]);

  const total = useMemo(() => {
    const t = subtotal + shippingCost - couponDiscount;
    return t < 0 ? 0 : t;
  }, [subtotal, shippingCost, couponDiscount]);

  /* ---------- Auth guard ---------- */
  useEffect(() => {
    const isAuthenticated = Cookies.get('userInfo');
    if (!isAuthenticated || !userId) {
      router.push('/login?redirect=/checkout');
    }
  }, [router, userId]);

  /* ---------- Fetch & prefill profile ---------- */
  useEffect(() => {
    let alive = true;
    if (!userId) return;

    (async () => {
      try {
        const res = await fetch(`https://test.amrita-fashions.com/shopy/users/${userId}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Profile HTTP ${res.status}: ${text || 'Failed to load user'}`);
        }

        const json = await res.json();
        const user = json?.user;

        if (!user || !user._id) throw new Error('Invalid profile response');
        if (user._id !== userId) {
          toast.error('Loaded profile does not match the current user.');
          return;
        }

        if (!alive) return;
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName || 'Customer',
          lastName: user.lastName || '',
          email: user.email || prev.email || '',
          phone: user.phone || prev.phone || 'Not provided',
          streetAddress: user.address || prev.streetAddress || 'Not provided',
          city: user.city || prev.city || 'Not provided',
          country: user.country || prev.country || 'India (IN)',
          postcode: user.pincode || prev.postcode || 'Not provided',
          state: user.state || 'Not provided',
          organisation: user.organisation || 'Not provided'
        }));
      } catch (e) {
        console.error('Failed to prefill profile:', e);
        toast.error('Could not load profile details.');
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  /* ---------- Handlers ---------- */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? Boolean(checked) : value,
    }));
  }, []);

  const handleShippingChange = useCallback((e) => {
    const value = e.target.value; // 'free' | 'flat' | 'local'
    setShippingMethod(value);
    const cost = value === 'free' ? 0 : value === 'flat' ? 15 : 8;
    setShippingCost(cost);
  }, []);

  const handleApplyCoupon = useCallback(
    (e) => {
      e.preventDefault();
      if (!couponCode.trim()) {
        setCouponDiscount(0);
        toast.info('Enter a coupon code');
        return;
      }
      if (couponCode.trim().toLowerCase() === 'welcome10') {
        setCouponDiscount(10);
        toast.success('Coupon applied successfully!');
      } else {
        setCouponDiscount(0);
        toast.error('Invalid coupon code');
      }
    },
    [couponCode]
  );

  // ✅ Place Order: create order, then CLEAR CART via {userId}, then navigate
  const handleSubmitOrder = useCallback(
    async (e) => {
      e.preventDefault();
      if (!userId) {
        toast.error('Please log in to place your order.');
        router.push('/login?redirect=/checkout');
        return;
      }
      if (cart_products.length === 0) {
        toast.error('Your cart is empty');
        return;
      }
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone ||
        !formData.streetAddress ||
        !formData.city ||
        !formData.postcode ||
        !formData.country
      ) {
        toast.error('Please fill all required fields');
        return;
      }

      try {
        const productId = cart_products
          .map((it) => it?.productId?._id)
          .filter((v) => Boolean(v));

        const quantity = cart_products.map((it) => Number(it?.quantity ?? 1));
        const price = cart_products.map((it) => Number(it?.productId?.price ?? 0));

        const shipping =
          shippingMethod === 'free' ? 'standard' : shippingMethod === 'flat' ? 'flat' : 'local';
        const payment = formData.paymentUI; // 'online' | 'cod'

        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          country:
            formData.country.includes('United States')
              ? 'USA'
              : formData.country.includes('United Kingdom')
              ? 'UK'
              : formData.country.includes('Canada')
              ? 'Canada'
              : formData.country.includes('Australia')
              ? 'Australia'
              : formData.country.includes('India')
              ? 'India'
              : formData.country,
          streetAddress: formData.streetAddress,
          city: formData.city,
          postcode: formData.postcode,
          phone: formData.phone,
          email: formData.email,
          shippingInstructions: formData.orderNotes || '',
          total,
          payment,
          discount: couponDiscount,
          shipping,
          shippingCost,
          userId,
          productId,
          quantity,
          price,
        };

        const resp = await createOrder(payload).unwrap();
        const createdOrder = resp?.data?.order;

        // Clear the cart for this user on the server
        await clearCartOnServer(userId);
        await refetch();

        toast.success('Order placed successfully!');
        const orderId = createdOrder?._id;
        if (orderId) {
          router.push(`/order/${orderId}`);
        } else {
          router.push(`/order-confirmation?userId=${userId}`);
        }
      } catch (err) {
        console.error('Order submission failed:', err);
        toast.error('Failed to place order. Please try again.');
      }
    },
    [
      cart_products,
      couponDiscount,
      createOrder,
      formData.city,
      formData.country,
      formData.email,
      formData.firstName,
      formData.lastName,
      formData.orderNotes,
      formData.paymentUI,
      formData.phone,
      formData.postcode,
      formData.streetAddress,
      refetch,
      router,
      shippingCost,
      shippingMethod,
      total,
      userId,
    ]
  );

  /* ---------- Loading / Error UIs ---------- */
  if (isLoading) {
    return (
      <div className="loader-wrap">
        <div className="spinner" />
        <p>Loading your cart...</p>
        <style jsx>{`
          .loader-wrap { min-height: 50vh; display: grid; place-content: center; gap: 16px; color: #253d4e; }
          .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3bb77e; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    const message = getErrorMessage(error);
    return (
      <div className="error-wrap">
        <div className="msg">Failed to load cart: {message}</div>
        <button onClick={() => refetch()}>Retry</button>
        <style jsx>{`
          .error-wrap { max-width: 800px; margin: 40px auto; padding: 30px; background: #fff8f8; border: 1px solid #ffdddd; border-radius: 8px; text-align: center; }
          .msg { color: #d32f2f; font-size: 16px; margin-bottom: 20px; }
          button { background: #3bb77e; color: #fff; border: 0; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
          button:hover { filter: brightness(0.95); }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <section className="modern-checkout-area">
        <div className="container">
          {/* Progress Steps */}
          <div className="checkout-progress">
            <div className="progress-steps">
              {['Shopping Cart', 'Checkout', 'Order Complete'].map((label, idx) => {
                const step = idx + 1;
                const active = step <= activeStep;
                const completed = step < activeStep;
                return (
                  <div className="progress-step" key={label}>
                    <div className={`step-indicator ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
                      <span className="step-number">
                        {completed ? <FaCheck /> : step}
                      </span>
                    </div>
                    <span className="step-label">{label}</span>
                    {step < 3 && <div className={`step-line ${active ? 'active' : ''}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="checkout-layout">
            {/* Billing Details Section */}
            <div className="billing-section">
              <div className="section-header">
                <h2>Billing Details</h2>
                <p>Please fill in your information to complete your order</p>
              </div>

              <form className="billing-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="firstName" 
                      className="field-input" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="lastName" 
                      className="field-input" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Country <span className="required">*</span>
                  </label>
                  <select 
                    name="country" 
                    className="field-input field-select" 
                    value={formData.country} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="United States (US)">United States (US)</option>
                    <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                    <option value="Canada (CA)">Canada (CA)</option>
                    <option value="Australia (AU)">Australia (AU)</option>
                    <option value="India (IN)">India (IN)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Street Address <span className="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="streetAddress" 
                    className="field-input" 
                    placeholder="House number and street name" 
                    value={formData.streetAddress} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      Town / City <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="city" 
                      className="field-input" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">
                      Postcode / ZIP <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="postcode" 
                      className="field-input" 
                      value={formData.postcode} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      Phone <span className="required">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      className="field-input" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      className="field-input" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Order Notes (Optional)</label>
                  <textarea 
                    className="field-input field-textarea" 
                    name="orderNotes" 
                    rows={4} 
                    placeholder="Notes about your order, e.g. special notes for delivery." 
                    value={formData.orderNotes} 
                    onChange={handleInputChange} 
                  />
                </div>
              </form>
            </div>

            {/* Order Summary Section */}
            <div className="order-summary-section">
              <div className="section-header">
                <h2>Order Summary</h2>
                <p>{cart_products.length} item{cart_products.length !== 1 ? 's' : ''} in your order</p>
              </div>

              {/* Products List */}
              <div className="products-section">
                <h3 className="section-title">Your Items</h3>
                <div className="products-list">
                  {cart_products.map((item) => {
                    const name = item?.productId?.name || 'Product';
                    const qty = Number(item?.quantity ?? 1);
                    const img =
                      item?.productId?.images?.[0]?.url ||
                      item?.productId?.img ||
                      item?.productId?.image ||
                      '/images/placeholder.png';
                    return (
                      <div className="product-card" key={item._id || item?.productId?._id}>
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

              {/* Place Order Button */}
              <div className="order-action">
                <button
                  type="button"
                  className="place-order-button"
                  onClick={handleSubmitOrder}
                  disabled={creatingOrder || cart_products.length === 0}
                >
                  {creatingOrder ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <span className="order-total">Total: ${total.toFixed(2)}</span>
                      <span className="order-text">Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Modern Styles */}
      <style jsx>{`
        .modern-checkout-area {
          padding: 60px 0 100px;
          background: linear-gradient(135deg, var(--tp-grey-1) 0%, var(--tp-grey-6) 100%);
          min-height: 100vh;
          position: relative;
        }

        .modern-checkout-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(135deg, var(--tp-theme-primary) 0%, var(--tp-blue-1) 100%);
          opacity: 0.03;
          z-index: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        /* Enhanced Progress Steps */
        .checkout-progress {
          margin-bottom: 50px;
          background: var(--tp-common-white);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          border: 1px solid var(--tp-border-primary);
        }

        .progress-steps {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
          position: relative;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-indicator {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--tp-grey-3);
          color: var(--tp-text-3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-bottom: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .step-indicator::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--tp-theme-primary), var(--tp-blue-1));
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 50%;
        }

        .step-indicator.active,
        .step-indicator.completed {
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          border-color: var(--tp-theme-primary);
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(9, 137, 255, 0.3);
        }

        .step-indicator.active::before,
        .step-indicator.completed::before {
          opacity: 1;
        }

        .step-indicator.active .step-number,
        .step-indicator.completed .step-number {
          position: relative;
          z-index: 1;
          color: var(--tp-common-white);
        }

        .step-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--tp-text-2);
          text-align: center;
          transition: color 0.3s ease;
        }

        .progress-step:has(.step-indicator.active) .step-label,
        .progress-step:has(.step-indicator.completed) .step-label {
          color: var(--tp-theme-primary);
        }

        .step-line {
          position: absolute;
          top: 30px;
          left: calc(100% + 20px);
          width: 80px;
          height: 3px;
          background: var(--tp-grey-3);
          transition: all 0.4s ease;
          border-radius: 2px;
        }

        .step-line.active {
          background: linear-gradient(90deg, var(--tp-theme-primary), var(--tp-blue-1));
        }

        /* Enhanced Layout */
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 40px;
          align-items: start;
        }

        .billing-section,
        .order-summary-section {
          background: var(--tp-common-white);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          border: 1px solid var(--tp-border-primary);
          position: relative;
          overflow: hidden;
        }

        .billing-section::before,
        .order-summary-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--tp-theme-primary), var(--tp-blue-1));
        }

        /* Enhanced Section Headers */
        .section-header {
          margin-bottom: 35px;
          padding-bottom: 25px;
          border-bottom: 2px solid var(--tp-grey-2);
          position: relative;
        }

        .section-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--tp-theme-primary), var(--tp-blue-1));
        }

        .section-header h2 {
          font-size: 22px !important;
          font-weight: 700;
          color: var(--tp-heading-primary);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .section-header p {
          color: var(--tp-text-2);
          margin: 0;
          font-size: 14px !important;
          line-height: 1.5;
        }

        /* Enhanced Form Styling */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-field {
          margin-bottom: 24px;
          position: relative;
        }

        .field-label {
          display: block;
          font-weight: 600;
          color: var(--tp-heading-primary);
          margin-bottom: 10px;
          font-size: 14px;
          letter-spacing: 0.2px;
        }

        .required {
          color: var(--tp-pink-1);
          margin-left: 2px;
        }

        .field-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid var(--tp-border-primary);
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--tp-common-white);
          color: var(--tp-heading-primary);
          font-family: inherit;
          position: relative;
        }

        .field-input::placeholder {
          color: var(--tp-text-3);
          font-size: 14px;
        }

        .field-input:focus {
          border-color: var(--tp-theme-primary);
          outline: none;
          box-shadow: 0 0 0 4px rgba(9, 137, 255, 0.1);
          transform: translateY(-1px);
        }

        .field-input:hover:not(:focus) {
          border-color: var(--tp-grey-3);
        }

        .field-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 20px center;
          background-size: 18px;
          padding-right: 55px;
          cursor: pointer;
        }

        .field-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
          padding-top: 16px;
          padding-bottom: 16px;
        }

        /* Enhanced Products Section */
        .products-section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 13px !important;
          font-weight: 600;
          color: var(--tp-heading-primary);
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--tp-grey-2);
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 30px;
          height: 1px;
          background: var(--tp-theme-primary);
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--tp-grey-1);
          border-radius: 16px;
          border: 2px solid var(--tp-border-primary);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(9, 137, 255, 0.05), transparent);
          transition: left 0.5s ease;
        }

        .product-card:hover {
          border-color: var(--tp-theme-primary);
          box-shadow: 0 8px 25px rgba(9, 137, 255, 0.15);
          transform: translateY(-2px);
        }

        .product-card:hover::before {
          left: 100%;
        }

        .product-image {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid var(--tp-border-primary);
          background: var(--tp-common-white);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.1);
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 13px !important;
          font-weight: 500;
          color: var(--tp-heading-primary);
          margin-bottom: 3px;
          line-height: 1.3;
        }

        .product-quantity {
          font-size: 11px !important;
          color: var(--tp-text-2);
          font-weight: 400;
        }

        /* Enhanced Order Action Section */
        .order-action {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid var(--tp-grey-2);
          position: relative;
        }

        .order-action::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--tp-theme-primary), var(--tp-blue-1));
        }

        .place-order-button {
          width: 100%;
          background: linear-gradient(135deg, var(--tp-theme-primary) 0%, var(--tp-blue-1) 100%);
          color: var(--tp-common-white);
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px !important;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 50px;
          box-shadow: 0 6px 20px rgba(9, 137, 255, 0.25);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
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
          box-shadow: 0 8px 25px rgba(9, 137, 255, 0.35);
        }

        .place-order-button:active {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(9, 137, 255, 0.25);
        }

        .place-order-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 15px rgba(9, 137, 255, 0.15);
        }

        .place-order-button:disabled::before {
          display: none;
        }

        .order-total {
          font-size: 14px !important;
          font-weight: 600;
          opacity: 0.9;
        }

        .order-text {
          font-size: 16px !important;
          font-weight: 700;
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

        /* Enhanced Responsive Design */
        @media (max-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .order-summary-section {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .modern-checkout-area {
            padding: 40px 0 60px;
          }

          .container {
            padding: 0 16px;
          }

          .checkout-progress {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 16px;
          }

          .progress-steps {
            gap: 20px;
          }

          .step-indicator {
            width: 50px;
            height: 50px;
          }

          .step-line {
            width: 40px;
            left: calc(100% + 10px);
          }

          .billing-section,
          .order-summary-section {
            padding: 30px 24px;
            border-radius: 20px;
          }

          .section-header {
            margin-bottom: 25px;
            padding-bottom: 20px;
          }

          .section-header h2 {
            font-size: 20px !important;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }

          .field-input {
            padding: 14px 18px;
            font-size: 16px !important; /* Prevent zoom on iOS */
          }

          .place-order-button {
            padding: 14px 20px;
            font-size: 15px !important;
            min-height: 48px;
          }
        }

        @media (max-width: 480px) {
          .modern-checkout-area {
            padding: 30px 0 50px;
          }

          .checkout-progress {
            padding: 16px;
            margin-bottom: 24px;
          }

          .progress-steps {
            gap: 15px;
          }

          .step-indicator {
            width: 45px;
            height: 45px;
          }

          .step-label {
            font-size: 13px;
          }

          .billing-section,
          .order-summary-section {
            padding: 24px 20px;
            border-radius: 16px;
          }

          .section-header h2 {
            font-size: 18px !important;
          }

          .section-header p {
            font-size: 13px !important;
          }

          .field-label {
            font-size: 13px !important;
          }

          .section-title {
            font-size: 12px !important;
          }

          .product-card {
            padding: 12px;
          }

          .product-image {
            width: 45px;
            height: 45px;
          }

          .product-name {
            font-size: 12px !important;
          }

          .product-quantity {
            font-size: 10px !important;
          }

          .place-order-button {
            padding: 12px 18px;
            font-size: 14px !important;
            min-height: 44px;
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutArea;