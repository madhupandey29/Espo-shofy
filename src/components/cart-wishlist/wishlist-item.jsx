'use client';
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Close } from '@/svg';
import { toast } from 'react-toastify';
import { mapProductFields, getContentName, getDesignName, getFinishName, getStructureName, getColorName } from '@/utils/productFieldMapper';

/* cart thunks */
import { add_to_cart, fetch_cart_products } from '@/redux/features/cartSlice';
import { removeWishlistItem, fetchWishlist } from '@/redux/features/wishlist-slice';

import LoginArea from '@/components/login-register/login-area';
import RegisterArea from '@/components/login-register/register-area';
import useWishlistManager from '@/hooks/useWishlistManager';

import useGlobalSearch from '@/hooks/useGlobalSearch';
import { buildSearchPredicate } from '@/utils/searchMiddleware';
import { useGetSeoByProductQuery } from '@/redux/features/seoApi';

/* ---------- helpers (JS only) ---------- */
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

/* ---------- empty-banner manager ---------- */
function useEmptyBanner(listId, rowVisible, emptyText) {
  const rowRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__listVis = window.__listVis || {};
    const bucket = (window.__listVis[listId] = window.__listVis[listId] || {
      vis: 0,
      banner: null,
    });

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
        </div>
      `;
      tr.appendChild(td);
      bucket.banner = tr;
      return tr;
    };

    const prev = rowRef.current ? rowRef.current.__wasVisible : undefined;
    if (prev === undefined) {
      if (rowVisible) bucket.vis += 1;
    } else {
      if (rowVisible && !prev) bucket.vis += 1;
      if (!rowVisible && prev) bucket.vis -= 1;
    }
    if (rowRef.current) rowRef.current.__wasVisible = rowVisible;

    const banner = bucket.banner;
    if (bucket.vis <= 0) {
      const b = ensureBannerExists();
      if (!b.isConnected) tbody.appendChild(b);
    } else if (banner && banner.isConnected) {
      banner.remove();
    }

    return () => {
      const was = rowRef.current ? rowRef.current.__wasVisible : undefined;
      if (was) bucket.vis = Math.max(0, bucket.vis - 1);
      if (rowRef.current) rowRef.current.__wasVisible = false;

      if (bucket.vis <= 0) {
        const b = ensureBannerExists();
        if (!b.isConnected && tbody.isConnected) tbody.appendChild(b);
      } else if (bucket.banner && bucket.banner.isConnected && bucket.vis > 0) {
        banner.remove();
      }
    };
  }, [listId, rowVisible, emptyText]);

  return { rowRef };
}

/* ---------- Component ---------- */
const WishlistItem = ({ product }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { cart_products } = useSelector((s) => s.cart) || {};
  const { userId, wishlist, loading } = useWishlistManager();
  const wlLoading = useSelector((s) => s.wishlist?.loading) ?? false;

  const _id =
    product?._id || product?.id || product?.product?._id || product?.productId || product?.product || null;

  const isInCart = cart_products?.find?.((item) => String(item?._id) === String(_id));

  const [moving, setMoving] = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  /* ---- HYDRATE ---- */
  const [hydrated, setHydrated] = useState(null);
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!_id) return;

      // Use field mapper to check for labels
      const mappedProduct = mapProductFields(product);
      const hasLabels =
        mappedProduct?.contentName ||
        mappedProduct?.design ||
        mappedProduct?.finishName ||
        mappedProduct?.structure ||
        mappedProduct?.colorName ||
        getContentName(product?.product) ||
        getDesignName(product?.product) ||
        getFinishName(product?.product) ||
        getStructureName(product?.product) ||
        getColorName(product?.product);

      if (hasLabels) return;

      const slug = product?.slug || product?.product?.slug;

      const endpoints = [
        `${apiBase}/products/${_id}`,
        `${apiBase}/product/${_id}`,
        `${apiBase}/product/single/${_id}`,
        `${apiBase}/api/products/${_id}`,
        `${apiBase}/api/product/${_id}`,
        slug ? `${apiBase}/products/slug/${slug}` : null,
        slug ? `${apiBase}/product/slug/${slug}` : null,
        slug ? `${apiBase}/api/products/slug/${slug}` : null,
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
        } catch {/*  */}
      }
    })();
    return () => {
      ignore = true;
    };
  }, [_id, product, apiBase]);

  /* SEO fallbacks */
  const { data: seoResp } = useGetSeoByProductQuery(_id, { skip: !_id });
  const seoDoc = Array.isArray(seoResp?.data) ? seoResp?.data?.[0] : seoResp?.data;

  // search
  const { debounced: globalQuery } = useGlobalSearch(150);
  const searchableFields = useMemo(
    () => [
      (p) => p?.title,
      (p) => p?.name,
      (p) => p?._id,
      (p) => p?.id,
      (p) => p?.slug,
      (p) => p?.fabricType || p?.fabric_type,
      (p) => toLabel(p?.content ?? hydrated?.content ?? seoDoc?.content),
      (p) => toLabel(p?.design ?? hydrated?.design ?? seoDoc?.design),
      (p) => toLabel(p?.subfinish ?? hydrated?.subfinish ?? seoDoc?.finish),
      (p) => toLabel(p?.substructure ?? hydrated?.substructure ?? seoDoc?.structure),
      (p) =>
        Array.isArray(p?.color)
          ? p.color.map((c) => toLabel(c?.name ?? c)).join(', ')
          : '',
      (p) => p?.widthLabel || p?.width_cm || p?.width,
      (p) => p?.tags,
      (p) => p?.sku,
    ],
    [hydrated, seoDoc]
  );

  const matchesQuery = useMemo(() => {
    const q = (globalQuery || '').trim();
    if (q.length < 2) return true;
    const pred = buildSearchPredicate(q, searchableFields, {
      mode: 'AND',
      normalize: true,
      minTokenLen: 2,
    });
    return pred(product);
  }, [globalQuery, product, searchableFields]);

  const showByServer = useMemo(() => {
    if (!Array.isArray(wishlist)) return false;
    return wishlist.some((it) => String(it?._id) === String(_id));
  }, [wishlist, _id]);

  const wlReady = Array.isArray(wishlist) && !wlLoading && !loading;
  const hidden = !wlReady || !matchesQuery || !showByServer;

  const { rowRef } = useEmptyBanner('wishlist', !hidden, 'No product found in wishlist');

  const currentUrlWithQuery = useMemo(() => {
    const url =
      typeof window !== 'undefined'
        ? new URL(window.location.href)
        : new URL('http://localhost');
    return url.pathname + url.search;
  }, [pathname, searchParams]);

  const pushAuthQuery = useCallback(
    (type) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (type) {
        url.searchParams.set('auth', type);
        url.searchParams.set('redirect', currentUrlWithQuery);
      } else {
        url.searchParams.delete('auth');
        url.searchParams.delete('redirect');
      }
      const qs = url.searchParams.toString();
      router.push(qs ? `${url.pathname}?${qs}` : url.pathname, { scroll: false });
    },
    [currentUrlWithQuery, router]
  );

  const closeAuth = useCallback(() => {
    setAuthModal(null);
    pushAuthQuery(null);
  }, [pushAuthQuery]);
  const openLogin = useCallback(() => {
    setAuthModal('login');
    pushAuthQuery('login');
  }, [pushAuthQuery]);
  const openRegister = useCallback(() => {
    setAuthModal('register');
    pushAuthQuery('register');
  }, [pushAuthQuery]);

  /* ---------- actions ---------- */
  const handleAddProduct = async () => {
    if (!userId) {
      openLogin();
      return;
    }
    if (!_id) return;
    try {
      setMoving(true);
      await dispatch(
        add_to_cart({ userId, productId: String(_id), quantity: 1 })
      ).unwrap?.();
      await dispatch(fetch_cart_products({ userId }));
      // Don't open cart mini - user stays on wishlist page

      await dispatch(
        removeWishlistItem({
          userId,
          productId: String(_id),
          title: getDisplayTitle,
        })
      ).unwrap?.();

      dispatch(fetchWishlist(userId));

      // Toast: white card style (like your "Added to wishlist")
      toast.dismiss();
      toast.success(`${getDisplayTitle} moved to cart`, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light', // important for white card + green progress
        toastId: `moved-${_id}`,
      });
    } catch (e) {
      console.error('Move to cart failed', e);
      toast.error('Failed to move item to cart', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setTimeout(() => setMoving(false), 250);
    }
  };

  const handleRemovePrd = async (prd) => {
    if (!userId) {
      openLogin();
      return;
    }
    try {
      await dispatch(
        removeWishlistItem({
          userId,
          productId: String(prd?.id || prd?._id),
          title: getDisplayTitle,
        })
      ).unwrap?.();
      dispatch(fetchWishlist(userId));
    } catch (e) {
      console.error('Remove failed', e);
      alert('Failed to remove item from wishlist. Please try again.');
    }
  };

  /* ---------- presentation ---------- */
  const fallbackCdn = (process.env.NEXT_PUBLIC_CDN_BASE || 'https://test.amrita-fashions.com/shopy').replace(/\/+$/, '');

  const valueToUrlString = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    if (Array.isArray(v)) return valueToUrlString(v[0]);
    if (typeof v === 'object') return valueToUrlString(v.secure_url || v.url || v.path || v.key || v.img);
    return '';
  };

  const rawImg =
    valueToUrlString(product?.img) ||
    valueToUrlString(product?.image) ||
    valueToUrlString(product?.image1) ||
    valueToUrlString(product?.image2) ||
    valueToUrlString(product?.product?.img) ||
    valueToUrlString(hydrated?.img) ||
    '';

  const isHttpUrl = (s) => /^https?:\/\//i.test(s || '');
  const clean = (p) =>
    String(p || '')
      .replace(/^\/+/, '')
      .replace(/^api\/uploads\/?/, '')
      .replace(/^uploads\/?/, '');

  const imageUrl = rawImg
    ? isHttpUrl(rawImg)
      ? rawImg
      : `${apiBase || fallbackCdn}/uploads/${clean(rawImg)}`
    : '';

  const getDisplayTitle = useMemo(() => {
    const nameOptions = [
      product?.title,
      product?.name,
      product?.product?.name,
      hydrated?.name,
      seoDoc?.title,
      product?.productname,
      product?.productTitle,
      product?.seoTitle,
      product?.groupcode?.name,
      product?.fabricType,
      product?.content,
      product?.design,
    ].filter(Boolean);

    const firstNice = nameOptions.map(toLabel).find((s) => s && s.length > 0);
    if (firstNice) return firstNice;

    const parts = [
      toLabel(product?.color || product?.colorName || hydrated?.color),
      toLabel(product?.content || hydrated?.content),
      toLabel(product?.fabricType || hydrated?.fabricType),
      toLabel(product?.design || hydrated?.design),
    ].filter(Boolean);
    return parts.length ? parts.join(' ') + ' Fabric' : 'Product';
  }, [product, hydrated, seoDoc, _id]);

  const slug = product?.slug || product?.product?.slug || hydrated?.slug || _id;

  const src =
    hydrated || product || product?.product || {};
  const gsm = Number(
    src.gsm ?? product?.gsm ?? product?.weightGsm ?? product?.weight_gsm
  );
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
    toLabel(pick(src.category?.name, src.fabricType, src.fabric_type)) ||
    'Woven Fabrics';
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

  // FIX: check widthCm (not gsm) here
  const widthVal =
    isFinite(widthCm) && widthCm > 0
      ? `${round(widthCm, 0)} cm / ${round(cmToInch(widthCm), 0)} inch`
      : toLabel(src.widthLabel);

  const row1Parts = [fabricTypeVal, colorsVal, contentVal, finishVal, structureVal, designVal].filter(
    (v) => nonEmpty(v) && !isNoneish(v)
  );
  const row2Parts = [weightVal, widthVal].filter((v) => nonEmpty(v) && !isNoneish(v));

  return (
    <>
      <div
        className={`myntra-wishlist-card ${hidden ? 'hidden' : ''}`}
        ref={rowRef}
        aria-hidden={hidden ? 'true' : 'false'}
      >
        <div className="card-image-container">
          <Link href={`/fabric/${slug}`} target="_blank" rel="noopener noreferrer" className="image-link">
            {!!imageUrl && (
              <img
                src={imageUrl}
                alt={getDisplayTitle || 'product image'}
                className="product-image"
                loading="lazy"
              />
            )}
          </Link>
          <button
            onClick={() => handleRemovePrd({ title: getDisplayTitle, id: _id })}
            className="remove-btn"
            type="button"
            title="Remove from wishlist"
          >
            <Close />
          </button>
        </div>

        <div className="card-content">
          <Link href={`/fabric/${slug}`} target="_blank" rel="noopener noreferrer" className="product-name">
            {getDisplayTitle || 'Product'}
          </Link>

          {(row1Parts.length > 0 || row2Parts.length > 0) && (
            <button
              className="details-toggle"
              onClick={() => setShowDetails(!showDetails)}
              type="button"
            >
              <span className="toggle-text">
                {showDetails ? 'Hide Details' : 'Show Details'}
              </span>
              <span className="toggle-icon">
                {showDetails ? '−' : '+'}
              </span>
            </button>
          )}

          {showDetails && (row1Parts.length > 0 || row2Parts.length > 0) && (
            <div className="product-details">
              {row1Parts.length > 0 && (
                <div className="detail-row">
                  {row1Parts.slice(0, 2).map((txt, i) => (
                    <span className="detail-item" key={`r1-${i}`}>
                      {txt}
                    </span>
                  ))}
                </div>
              )}
              {row1Parts.length > 2 && (
                <div className="detail-row">
                  {row1Parts.slice(2, 4).map((txt, i) => (
                    <span className="detail-item" key={`r1b-${i}`}>
                      {txt}
                    </span>
                  ))}
                </div>
              )}
              {row2Parts.length > 0 && (
                <div className="detail-row specs">
                  {row2Parts.map((txt, i) => (
                    <span className="detail-item" key={`r2-${i}`}>
                      {txt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleAddProduct}
            type="button"
            className={`move-to-bag-btn ${moving ? 'loading' : ''} ${isInCart ? 'in-cart' : ''}`}
            aria-busy={moving ? 'true' : 'false'}
            title="Move to Cart"
            disabled={!!isInCart && !moving}
          >
            {moving ? 'Moving...' : isInCart ? 'In Cart' : 'MOVE TO CART'}
          </button>
        </div>
      </div>

      {/* AUTH MODALS */}
      {authModal === 'login' && (
        <LoginArea onClose={closeAuth} onSwitchToRegister={openRegister} />
      )}
      {authModal === 'register' && (
        <RegisterArea onClose={closeAuth} onSwitchToLogin={openLogin} />
      )}

      <style jsx>{`
        .myntra-wishlist-card {
          background: var(--tp-common-white);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #f0f0f0;
        }

        .myntra-wishlist-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .myntra-wishlist-card.hidden {
          display: none;
        }

        .card-image-container {
          position: relative;
          aspect-ratio: 1/1;
          overflow: hidden;
          background: #fafafa;
          flex-shrink: 0;
        }

        .image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .myntra-wishlist-card:hover .product-image {
          transform: scale(1.02);
        }

        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          color: #666;
          z-index: 2;
        }

        .remove-btn:hover {
          background: var(--tp-theme-primary);
          color: white;
          transform: scale(1.1);
        }

        .card-content {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-name {
          display: block;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.3;
          color: var(--tp-theme-primary);
          text-decoration: none;
          margin-bottom: 12px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 42px;
        }

        .product-name:hover {
          color: color-mix(in srgb, var(--tp-theme-primary) 80%, black);
        }

        .price-section {
          margin-bottom: 8px;
        }

        .product-price {
          font-weight: 700;
          font-size: 14px;
          color: #282c3f;
        }

        .details-toggle {
          background: var(--tp-grey-1);
          border: 1px solid var(--tp-grey-3);
          color: var(--tp-theme-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          margin-bottom: 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          width: 100%;
        }

        .details-toggle:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border-color: var(--tp-theme-primary);
        }

        .toggle-icon {
          font-size: 18px;
          font-weight: 300;
          line-height: 1;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .details-toggle:hover .toggle-icon {
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
        }

        .product-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          font-size: 12px;
          animation: slideDown 0.3s ease;
          border: 1px solid var(--tp-grey-2);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .detail-row {
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-row.specs {
          color: #666;
          font-weight: 500;
        }

        .detail-item {
          position: relative;
          color: #666;
        }

        .detail-item:not(:last-child)::after {
          content: ' • ';
          margin: 0 4px;
          color: #999;
        }

        .move-to-bag-btn {
          width: 100%;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: none;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: auto;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .move-to-bag-btn:hover:not(:disabled) {
          background: color-mix(in srgb, var(--tp-theme-primary) 85%, black);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(44, 76, 151, 0.3);
        }

        .move-to-bag-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .move-to-bag-btn.in-cart {
          background: #03a685;
          color: white;
          cursor: default;
        }

        .move-to-bag-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .card-content {
            padding: 10px;
          }

          .product-name {
            font-size: 15px;
            min-height: 38px;
            margin-bottom: 10px;
          }

          .details-toggle {
            font-size: 12px;
            padding: 6px 10px;
            margin-bottom: 10px;
          }

          .toggle-icon {
            width: 18px;
            height: 18px;
            font-size: 16px;
          }

          .product-details {
            padding: 10px;
            font-size: 11px;
            margin-bottom: 12px;
          }

          .move-to-bag-btn {
            padding: 8px 10px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .card-content {
            padding: 8px;
          }

          .product-name {
            font-size: 14px;
            min-height: 36px;
            margin-bottom: 8px;
          }

          .details-toggle {
            font-size: 11px;
            padding: 6px 8px;
            margin-bottom: 8px;
          }

          .toggle-icon {
            width: 16px;
            height: 16px;
            font-size: 14px;
          }

          .product-details {
            padding: 8px;
            font-size: 10px;
            margin-bottom: 10px;
          }

          .move-to-bag-btn {
            padding: 7px 8px;
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default WishlistItem;
