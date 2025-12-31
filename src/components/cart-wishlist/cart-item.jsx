'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { Minus, Plus } from '@/svg';
import { selectUserId } from '@/utils/userSelectors';
import { buildSearchPredicate } from '@/utils/searchMiddleware';
import useGlobalSearch from '@/hooks/useGlobalSearch';
import { useGetSeoByProductQuery } from '@/redux/features/seoApi';
import {
  useUpdateCartItemMutation,
  useGetCartDataQuery,
} from '@/redux/features/cartApi';
import { fetch_cart_products } from '@/redux/features/cartSlice';

/* -------------------------- tiny helpers (no any) -------------------------- */
const nonEmpty = (v) =>
  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== '';

const pick = (...xs) => xs.find(nonEmpty);
const looksLikeId = (s) =>
  /^[a-f0-9]{24}$/i.test(String(s || '')) || /^[0-9a-f-]{8,}$/i.test(String(s || ''));

const toLabel = (v) => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') {
    const s = String(v).trim();
    return looksLikeId(s) ? '' : s;
  }
  if (Array.isArray(v)) return v.map(toLabel).filter(Boolean).join(', ');
  if (typeof v === 'object') return toLabel(v.name ?? v.title ?? v.value ?? v.label ?? '');
  return '';
};

const round = (n, d = 1) => (isFinite(n) ? Number(n).toFixed(d).replace(/\.0+$/, '') : '');
const gsmToOz = (gsm) => gsm * 0.0294935;
const cmToInch = (cm) => cm / 2.54;
const isNoneish = (s) => {
  if (!s) return true;
  const t = String(s).trim().toLowerCase().replace(/\s+/g, ' ');
  return ['none', 'na', 'none/ na', 'none / na', 'n/a', '-'].includes(t);
};

const valueToUrlString = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return valueToUrlString(v[0]);
  if (typeof v === 'object') return valueToUrlString(v.secure_url || v.url || v.path || v.key || v.img || v.image);
  return '';
};
const isHttpUrl = (s) => /^https?:\/\//i.test(s || '');
const clean = (p) =>
  String(p || '').replace(/^\/+/, '').replace(/^api\/uploads\/?/, '').replace(/^uploads\/?/, '');

/* ------------------------------ empty banner ------------------------------ */
function useEmptyBanner(listId, rowVisible, emptyText) {
  const rowRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const buckets = (window.__listVis = window.__listVis || {});
    const bucket = (buckets[listId] = buckets[listId] || { vis: 0, banner: null });
    const tbody = rowRef.current?.closest('tbody');
    if (!tbody) return;

    const ensureBannerExists = () => {
      if (bucket.banner && bucket.banner.isConnected) return bucket.banner;
      const tr = document.createElement('tr');
      tr.className = 'empty-row';
      const td = document.createElement('td');
      td.colSpan = 999;
      td.innerHTML = `
        <div class="empty-wrap" role="status" aria-live="polite">
          <svg class="empty-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path fill="currentColor" d="M10 18a8 8 0 1 1 5.3-14.03l4.36-4.35 1.41 1.41-4.35 4.36A8 8 0 0 1 10 18zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm10.59 6L16.3 17.7a8.96 8.96 0 0 0 1.41-1.41L22 20.59 20.59 22z"/>
          </svg>
          <span class="empty-text">${emptyText}</span>
        </div>`;
      tr.appendChild(td);
      bucket.banner = tr;
      return tr;
    };

    const prevStr = rowRef.current?.dataset.wasVisible;
    const prev =
      prevStr === 'true' ? true : prevStr === 'false' ? false : undefined;

    if (prev === undefined) {
      if (rowVisible) bucket.vis += 1;
    } else {
      if (rowVisible && !prev) bucket.vis += 1;
      if (!rowVisible && prev) bucket.vis -= 1;
    }
    if (rowRef.current) rowRef.current.dataset.wasVisible = String(rowVisible);

    const banner = bucket.banner;
    if (bucket.vis <= 0) {
      const b = ensureBannerExists();
      if (!b.isConnected) tbody.appendChild(b);
    } else if (banner && banner.isConnected) {
      banner.remove();
    }

    return () => {
      const was = rowRef.current?.dataset.wasVisible === 'true';
      if (was) bucket.vis = Math.max(0, bucket.vis - 1);
      if (rowRef.current) rowRef.current.dataset.wasVisible = 'false';

      if (bucket.vis <= 0) {
        const b = ensureBannerExists();
        if (!b.isConnected && tbody.isConnected) tbody.appendChild(b);
      } else if (bucket.banner && bucket.banner.isConnected && bucket.vis > 0) {
        bucket.banner.remove();
      }
    };
  }, [listId, rowVisible, emptyText]);

  return { rowRef };
}

/* ----------------------------- inline icons ---------------------------- */
const TrashIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M9 3h6a1 1 0 0 1 1 1v1h5v2h-1l-1.2 12.4A3 3 0 0 1 15.8 23H8.2a3 3 0 0 1-2.98-3.59L4 7H3V5h5V4a1 1 0 0 1 1-1Zm2 0v1h2V3h-2ZM6 7l1.18 12.1A1 1 0 0 0 8.2 20h7.6a1 1 0 0 0 1.02-.9L18 7H6Zm3 3h2v8H9v-8Zm4 0h2v8h-2v-8Z"
    />
  </svg>
);

/** Clean heart icon for wishlist (stroke to match theme) */
const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M12 21s-6.72-4.13-9.33-7.29C.92 11.6 1.19 8.7 3.2 6.98c2.09-1.78 5.06-1.34 6.84.75L12 9.87l1.96-2.14c1.78-2.09 4.75-2.53 6.84-.75 2.01 1.72 2.28 4.62.53 6.73C18.72 16.87 12 21 12 21z"
    />
  </svg>
);

/* --------------------------------- row ----------------------------------- */
const CartItem = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const userId = useSelector(selectUserId);

  // keep cart query in sync (for hard refresh)
  const { refetch: refetchCart } = useGetCartDataQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGone, setIsGone] = useState(false);

  // Map incoming shape (your API sometimes nests product)
  const { productId, _id, id, slug, img, image, title, salesPrice, price, orderQuantity } =
    product || {};
  const nested = typeof productId === 'object' && productId ? productId : null;
  const PID = (nested && nested._id) || (typeof productId === 'string' ? productId : null) || _id || id || '';

  // Hydrate like wishlist (for labels)
  const [hydrated, setHydrated] = useState(null);
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!PID && !(nested?.slug || slug)) return;
      const pslug = nested?.slug || slug || product?.product?.slug;
      const endpoints = [
        PID ? `${apiBase}/products/${PID}` : null,
        PID ? `${apiBase}/product/${PID}` : null,
        PID ? `${apiBase}/product/single/${PID}` : null,
        PID ? `${apiBase}/api/products/${PID}` : null,
        PID ? `${apiBase}/api/product/${PID}` : null,
        pslug ? `${apiBase}/products/slug/${pslug}` : null,
        pslug ? `${apiBase}/product/slug/${pslug}` : null,
        pslug ? `${apiBase}/api/products/slug/${pslug}` : null,
      ].filter(Boolean);
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { credentials: 'include' });
          if (!res.ok) continue;
          const json = await res.json();
          const data = json?.data ?? json;
          if (data && typeof data === 'object' && !ignore) {
            setHydrated(data);
            break;
          }
        } catch { /* noop */ }
      }
    })();
    return () => { ignore = true; };
  }, [PID, slug, nested, product, apiBase]);

  const { data: seoResp } = useGetSeoByProductQuery(PID, { skip: !PID });
  const seoDoc = Array.isArray(seoResp?.data) ? seoResp?.data?.[0] : seoResp?.data;

  const name = useMemo(() => {
    const firstNice = [
      nested?.name,
      title,
      hydrated?.name,
      seoDoc?.title,
      product?.product?.name,
      product?.productTitle,
      product?.productname,
      product?.groupcode?.name,
      product?.fabricType,
      product?.content,
      product?.design,
    ]
      .filter(Boolean)
      .map(toLabel)
      .find(Boolean);
    if (firstNice) return firstNice;

    const parts = [
      toLabel(product?.color || product?.colorName || hydrated?.color || nested?.color),
      toLabel(product?.content || hydrated?.content || nested?.content),
      toLabel(product?.fabricType || hydrated?.fabricType || nested?.fabricType),
      toLabel(product?.design || hydrated?.design || nested?.design),
    ].filter(Boolean);
    return parts.length ? parts.join(' ') + ' Fabric' : 'Product';
  }, [product, nested, hydrated, seoDoc, title]);

  const safeSlug = nested?.slug || slug || hydrated?.slug || PID || '';
  const href = `/fabric/${safeSlug}`;

  // image
  const fallbackCdn = (process.env.NEXT_PUBLIC_CDN_BASE || 'https://test.amrita-fashions.com/shopy').replace(/\/+$/, '');
  const rawImg =
    valueToUrlString(product?.img) ||
    valueToUrlString(product?.image) ||
    valueToUrlString(product?.image1) ||
    valueToUrlString(product?.image2) ||
    valueToUrlString(product?.product?.img) ||
    valueToUrlString(product?.product?.image) ||
    valueToUrlString(product?.product?.image1) ||
    valueToUrlString(nested?.img || nested?.image || nested?.image1) ||
    valueToUrlString(img) ||
    valueToUrlString(image) ||
    valueToUrlString(hydrated?.img) ||
    '';
  const imageUrl = rawImg
    ? isHttpUrl(rawImg)
      ? rawImg
      : `${apiBase || fallbackCdn}/uploads/${clean(rawImg)}`
    : '/images/placeholder-portrait.webp';

  // meta (same as wishlist)
  const src = hydrated || product || product?.product || {};
  const gsm = Number(src.gsm ?? product?.gsm ?? product?.weightGsm ?? product?.weight_gsm);
  const widthCm = Number(
    src.cm ??
      src.widthCm ??
      src.width_cm ??
      src.width ??
      product?.widthCm ??
      product?.width_cm ??
      product?.width
  );
  const fabricTypeVal =
    toLabel(pick(src.category?.name, src.fabricType, src.fabric_type)) || 'Woven Fabrics';
  const contentVal = toLabel(pick(src.content, seoDoc?.content));
  const designVal = toLabel(pick(src.design, seoDoc?.design));
  const finishVal = toLabel(pick(src.subfinish, seoDoc?.finish));
  const structureVal = toLabel(pick(src.substructure, seoDoc?.structure));
  const colorsVal = Array.isArray(src.color)
    ? toLabel(src.color.map((c) => c?.name ?? c))
    : toLabel(pick(src.colorName, src.color));

  const weightVal =
    isFinite(gsm) && gsm > 0
      ? `${round(gsm)} gsm / ${round(gsmToOz(gsm))} oz`
      : toLabel(src.weight);
  const widthVal =
    isFinite(widthCm) && widthCm > 0
      ? `${round(widthCm, 0)} cm / ${round(cmToInch(widthCm), 0)} inch`
      : toLabel(src.widthLabel);

  const row1Parts = [fabricTypeVal, colorsVal, contentVal, finishVal, structureVal, designVal].filter(
    (v) => nonEmpty(v) && !isNoneish(v)
  );
  const row2Parts = [weightVal, widthVal].filter((v) => nonEmpty(v) && !isNoneish(v));

  // pricing/qty
  const unit = typeof salesPrice === 'number' ? salesPrice : Number.parseFloat(String(salesPrice)) || price || 0;
  const lineTotal = (unit || 0) * (orderQuantity || 0);

  // actions
  const removeFromCart = useCallback(
    async (productIdToRemove) => {
      const url = `https://test.amrita-fashions.com/shopy/cart/remove/${productIdToRemove}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Cart remove failed');
      await res.json().catch(() => ({}));
    },
    [userId]
  );

  const addToWishlist = useCallback(async (uId, pId) => {
    const base = `https://test.amrita-fashions.com/shopy/wishlist/add`;
    const attempts = [
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({ userId: String(uId), productId: String(pId) }),
      },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ userId: uId, productId: pId }),
      },
      {
        method: 'POST',
        body: (() => {
          const fd = new FormData();
          fd.append('userId', String(uId));
          fd.append('productId', String(pId));
          return fd;
        })(),
      },
      { method: 'POST', url: `${base}?userId=${encodeURIComponent(String(uId))}&productId=${encodeURIComponent(String(pId))}` },
    ];
    let last = null;
    for (const opt of attempts) {
      try {
        const target = opt.url ? opt.url : base;
        const { url: _u, ...fetchOpts } = opt;
        const res = await fetch(target, { ...fetchOpts, credentials: 'include' });
        if (res.ok) {
          await res.json().catch(() => ({}));
          return;
        }
      } catch (e) {
        last = e;
      }
    }
    throw last || new Error('Failed to add to wishlist');
  }, []);

  const hardRefreshCart = useCallback(() => {
    if (userId) dispatch(fetch_cart_products({ userId }));
    refetchCart?.();
    router.refresh?.();
  }, [dispatch, refetchCart, router, userId]);

  const inc = async () => {
    if (!PID || isUpdating) return;
    try {
      await updateCartItem({ productId: PID, quantity: (orderQuantity || 0) + 1, userId }).unwrap();
      hardRefreshCart();
    } catch { /* noop */ }
  };
  const dec = async () => {
    if (!PID || isUpdating || (orderQuantity || 0) <= 1) return;
    try {
      await updateCartItem({ productId: PID, quantity: Math.max(1, (orderQuantity || 0) - 1), userId }).unwrap();
      hardRefreshCart();
    } catch { /* noop */ }
  };

  const removeOnly = async () => {
    if (!PID || isRemoving || isSaving) return;
    setIsRemoving(true);
    try {
      await removeFromCart(PID);
      setIsGone(true);
      hardRefreshCart();
      toast.success('Removed from cart', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } catch {
      toast.error('Failed to remove item', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const saveForWishlist = async () => {
    if (!PID || !userId || isSaving || isRemoving) return;
    setIsSaving(true);
    try {
      await addToWishlist(userId, PID);
      await removeFromCart(PID);
      setIsGone(true);
      hardRefreshCart();
      toast.success('Moved to wishlist', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } catch {
      toast.error('Failed to save to wishlist', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // search visibility
  const { debounced: q } = useGlobalSearch();
  const searchVisible = useMemo(() => {
    const query = (q || '').trim();
    if (query.length < 2) return true;
    const fields = [() => name || '', () => safeSlug || '', () => String(product?.design ?? ''), () => String(product?.color ?? '')];
    const pred = buildSearchPredicate(query, fields, { mode: 'AND', normalize: true });
    return pred(product);
  }, [q, product, name, safeSlug]);

  const rowVisible = searchVisible && !isGone;
  const { rowRef } = useEmptyBanner('cart', !!rowVisible, 'No product found in cart');

  return (
    <>
      <div className="myntra-cart-card" ref={rowRef} style={!rowVisible ? { display: 'none' } : undefined}>
        {/* Product Image */}
        <div className="cart-card-image">
          <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
            <Image src={imageUrl} alt={name} width={80} height={100} className="product-img" />
          </Link>
        </div>

        {/* Product Content */}
        <div className="cart-card-content">
          {/* Header with title and remove button */}
          <div className="card-header">
            <Link href={href} target="_blank" rel="noopener noreferrer" className="product-title">
              {name}
            </Link>
            <button
              type="button"
              onClick={removeOnly}
              disabled={isRemoving || isSaving}
              className="remove-btn"
              title="Remove item"
              aria-label="Remove item"
            >
              ×
            </button>
          </div>

          {/* Product Details */}
          {(row1Parts.length || row2Parts.length) ? (
            <div className="product-details">
              {row1Parts.length > 0 && (
                <div className="detail-row">
                  {row1Parts.slice(0, 3).map((txt, i) => (
                    <span className="detail-tag" key={`r1-${i}`}>{txt}</span>
                  ))}
                </div>
              )}
              {row2Parts.length > 0 && (
                <div className="detail-row specs">
                  {row2Parts.slice(0, 2).map((txt, i) => (
                    <span className="detail-tag" key={`r2-${i}`}>{txt}</span>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Actions: Quantity + Move to Wishlist */}
          <div className="card-actions">
            <div className="quantity-control">
              <button 
                type="button" 
                className="qty-btn" 
                onClick={dec} 
                disabled={isUpdating || (orderQuantity || 0) <= 1}
                aria-label={`Decrease ${name}`}
              >
                <Minus />
              </button>
              <span className="qty-display">{orderQuantity}</span>
              <button 
                type="button" 
                className="qty-btn" 
                onClick={inc} 
                disabled={isUpdating}
                aria-label={`Increase ${name}`}
              >
                <Plus />
              </button>
            </div>

            <button
              type="button"
              onClick={saveForWishlist}
              disabled={isSaving || isRemoving || !userId}
              className="wishlist-btn"
              title="Move to wishlist"
              aria-label="Move to wishlist"
            >
              <HeartIcon />
              <span>Move to Wishlist</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .myntra-cart-card {
          display: flex;
          padding: 16px;
          border-bottom: 1px solid var(--tp-grey-2);
          gap: 16px;
          transition: background-color 0.2s ease;
          background: var(--tp-common-white);
        }

        .myntra-cart-card:hover {
          background-color: var(--tp-grey-1);
        }

        .myntra-cart-card:last-child {
          border-bottom: none;
        }

        .cart-card-image {
          flex-shrink: 0;
          width: 80px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--tp-grey-1);
        }

        .cart-card-image a {
          display: block;
          width: 100%;
          height: 100%;
        }

        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .cart-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .product-title {
          font-weight: 600;
          font-size: 18px;
          color: var(--tp-theme-primary);
          text-decoration: none;
          line-height: 1.3;
          flex: 1;
        }

        .product-title:hover {
          color: color-mix(in srgb, var(--tp-theme-primary) 80%, black);
        }

        .remove-btn {
          background: none;
          border: none;
          color: var(--tp-text-2);
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .product-details {
          margin: 8px 0;
          background: var(--tp-grey-1);
          border-radius: 8px;
          padding: 12px;
          border: 1px solid var(--tp-grey-2);
        }

        .detail-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-row.specs {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid var(--tp-grey-3);
        }

        .detail-tag {
          font-size: 13px;
          color: var(--tp-text-1);
          background: var(--tp-common-white);
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--tp-grey-3);
          font-weight: 500;
        }

        .detail-row.specs .detail-tag {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          font-size: 12px;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          gap: 12px;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--tp-grey-1);
          border-radius: 8px;
          padding: 4px;
        }

        .qty-btn {
          background: var(--tp-common-white);
          border: 1px solid var(--tp-grey-3);
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border-color: var(--tp-theme-primary);
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-display {
          font-weight: 600;
          font-size: 16px;
          color: var(--tp-text-1);
          min-width: 24px;
          text-align: center;
        }

        .wishlist-btn {
          background: transparent;
          border: 1px solid var(--tp-theme-primary);
          color: var(--tp-theme-primary);
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .wishlist-btn:hover:not(:disabled) {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
        }

        .wishlist-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .myntra-cart-card {
            padding: 12px;
            gap: 12px;
          }

          .cart-card-image {
            width: 70px;
            height: 90px;
          }

          .product-title {
            font-size: 16px;
          }

          .product-details {
            padding: 10px;
            margin: 6px 0;
          }

          .detail-tag {
            font-size: 12px;
            padding: 4px 8px;
          }

          .detail-row.specs .detail-tag {
            font-size: 11px;
            padding: 4px 8px;
          }

          .qty-btn {
            width: 28px;
            height: 28px;
          }

          .qty-display {
            font-size: 14px;
          }

          .wishlist-btn {
            font-size: 12px;
            padding: 6px 10px;
            flex: 1;
            justify-content: center;
          }

          .card-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .quantity-control {
            align-self: flex-start;
          }
        }

        @media (max-width: 480px) {
          .myntra-cart-card {
            padding: 10px;
            gap: 10px;
          }

          .cart-card-image {
            width: 60px;
            height: 80px;
          }

          .product-title {
            font-size: 15px;
          }

          .product-details {
            padding: 8px;
            margin: 4px 0;
          }

          .detail-row {
            gap: 4px;
          }

          .detail-tag {
            font-size: 11px;
            padding: 3px 6px;
          }

          .detail-row.specs .detail-tag {
            font-size: 10px;
            padding: 3px 6px;
          }

          .wishlist-btn {
            font-size: 11px;
            padding: 8px 12px;
            gap: 4px;
          }

          .wishlist-btn span {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default CartItem;
