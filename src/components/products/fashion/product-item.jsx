'use client';

import React, { useEffect, useState, useId, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { formatProductForCart, formatProductForWishlist } from '@/utils/authUtils';
import { add_to_cart, openCartMini, fetch_cart_products } from '@/redux/features/cartSlice';
import { toggleWishlistItem } from '@/redux/features/wishlist-slice';

import { Cart, CartActive, Wishlist, WishlistActive, QuickView, Share } from '@/svg';
import { handleProductModal } from '@/redux/features/productModalSlice';
import { useGetProductsByGroupcodeQuery } from '@/redux/features/productApi';
import { useGetSeoByProductQuery } from '@/redux/features/seoApi';

import useGlobalSearch from '@/hooks/useGlobalSearch';
import { buildSearchPredicate } from '@/utils/searchMiddleware';
import { selectUserId } from '@/utils/userSelectors';

/* helpers */
const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== '');
const pick = (...xs) => xs.find(nonEmpty);
const toText = (v) => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join(', ');
  if (typeof v === 'object') return toText(v.name ?? v.value ?? v.title ?? v.label ?? '');
  return '';
};
const isNoneish = (s) => {
  if (!s) return true;
  const t = String(s).trim().toLowerCase().replace(/\s+/g, ' ');
  return ['none', 'na', 'none/ na', 'none / na', 'n/a', '-'].includes(t);
};
const round = (n, d = 1) => (isFinite(n) ? Number(n).toFixed(d).replace(/\.0+$/, '') : '');
const gsmToOz = (gsm) => gsm * 0.0294935;
const cmToInch = (cm) => cm / 2.54;
const uniq = (arr) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x).trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, ' ');

/* gradient colors for options ribbon */
const getGradientColors = (count) => {
  const gradients = [
    { from: '#2C4C97', to: '#1e3a8a' }, // primary blue variations
    { from: '#D6A74B', to: '#B8941F' }, // secondary gold variations  
    { from: '#1E824C', to: '#166534' }, // green variations
    { from: '#7c3aed', to: '#5b21b6' }, // purple variations
    { from: '#dc2626', to: '#991b1b' }, // red variations
    { from: '#0891b2', to: '#0e7490' }, // cyan variations
    { from: '#ea580c', to: '#c2410c' }, // orange variations
    { from: '#be185d', to: '#9d174d' }, // pink variations
  ];
  return gradients[count % gradients.length] || gradients[0];
};

/* safely extract a comparable id */
const getAnyId = (obj) =>
  obj?._id || obj?.id || obj?.productId || obj?.slug || obj?.productslug || obj?.product?._id || obj?.product?.id || obj?.product;

/* ensure a robust cart payload for your slice */
const buildCartItem = (prd, opts = {}) => {
  const id = getAnyId(prd);
  const slug = prd?.slug || prd?.product?.slug || id;
  const name =
    prd?.name ||
    prd?.product?.name ||
    prd?.productname ||
    prd?.title ||
    prd?.productTitle ||
    prd?.groupcode?.name ||
    'Product';

  const price =
    prd?.price ??
    prd?.mrp ??
    prd?.minPrice ??
    prd?.sellingPrice ??
    prd?.product?.price ??
    0;

  const image =
    prd?.image ||
    prd?.img ||
    prd?.image1 ||
    prd?.image2 ||
    prd?.thumbnail ||
    prd?.images?.[0] ||
    prd?.mainImage ||
    '/assets/img/product/default-product-img.jpg';

  return {
    _id: id,
    id,
    productId: id,
    name,
    slug,
    image,
    price,
    qty: opts.qty ?? 1,
    product: prd,
    ...opts,
  };
};

/**
 * ✅ IMPORTANT:
 * Pass `index` from the map in Shop page:
 * products.map((p, i) => <ProductItem key={...} product={p} index={i} />)
 */
const ProductItem = ({ product, index = 0 }) => {
  const router = useRouter();
  const rainbowId = useId();
  const dispatch = useDispatch();

  const { debounced: q } = useGlobalSearch();

  const [showActions, setShowActions] = useState(false);
  const [supportsHover, setSupportsHover] = useState(true);
  const [addingCart, setAddingCart] = useState(false);
  const [optimisticInCart, setOptimisticInCart] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupportsHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }
  }, []);

  const userId = useSelector(selectUserId);

  /* image helpers */
  const valueToUrlString = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    if (Array.isArray(v)) return valueToUrlString(v[0]);
    if (typeof v === 'object') return valueToUrlString(v.secure_url || v.url || v.path || v.key);
    return '';
  };
  const isHttpUrl = (s) => /^https?:\/\//i.test(s);

  const imageUrl = useMemo(() => {
    // First check for Cloudinary URLs (direct URLs)
    const cloudinaryFields = [
      product?.image1CloudUrl, product?.image2CloudUrl, product?.image3CloudUrl,
      product?.imageCloudUrl, product?.cloudUrl
    ];

    console.log('ProductItem Debug:', {
      productId: getAnyId(product),
      productName: product?.name,
      image1CloudUrl: product?.image1CloudUrl,
      image2CloudUrl: product?.image2CloudUrl,
      image3CloudUrl: product?.image3CloudUrl,
      img: product?.img,
      image1: product?.image1,
      image2: product?.image2
    });

    for (const field of cloudinaryFields) {
      if (field && typeof field === 'string' && field.trim() && 
          field !== 'null' && field !== 'undefined' && field !== '') {
        const cleanUrl = field.trim();
        if (cleanUrl.startsWith('http')) {
          console.log('Using Cloudinary URL:', cleanUrl);
          return cleanUrl;
        }
      }
    }

    // Fallback to other image fields
    const raw =
      valueToUrlString(product?.img) ||
      valueToUrlString(product?.image1) ||
      valueToUrlString(product?.image2) ||
      valueToUrlString(product?.image3) ||
      valueToUrlString(product?.image) ||
      valueToUrlString(product?.images) ||
      valueToUrlString(product?.thumbnail);
      
    if (!raw) {
      console.log('No image found, using fallback');
      return '/assets/img/blog/fallback.jpg';
    }
    if (isHttpUrl(raw)) {
      console.log('Using HTTP URL:', raw);
      return raw;
    }

    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    const clean = (p) =>
      (p || '')
        .replace(/^\/+/, '')
        .replace(/^api\/uploads\/?/, '')
        .replace(/^uploads\/?/, '');
    const finalUrl = `${base}/uploads/${clean(raw)}`;
    console.log('Constructed URL:', finalUrl);
    return finalUrl;
  }, [product]);

  /* title, slug, category */
  const productId = getAnyId(product);
  const { data: seoResp } = useGetSeoByProductQuery(productId, { skip: !productId });
  const seoDoc = Array.isArray(seoResp?.data) ? seoResp?.data?.[0] : seoResp?.data;

  const titleHtml =
    pick(
      product?.name,
      product?.product?.name,
      product?.productname,
      product?.title,
      product?.productTitle,
      seoDoc?.title,
      product?.seoTitle,
      product?.groupcode?.name
    ) || '—';

  const titleText = stripHtml(titleHtml).trim() || 'Product';

  const slug = product?.slug || product?.productslug || product?.product?.slug || seoDoc?.slug || productId;

  const categoryLabel =
    pick(
      product?.category?.name,
      product?.category, // New API returns category as string
      product?.product?.category?.name,
      product?.categoryName,
      seoDoc?.category
    ) || '';

  /* options count */
  const groupcodeId = product?.groupcode?._id || product?.groupcode || null;
  const { data: groupItems = [], isFetching, isError } =
    useGetProductsByGroupcodeQuery(groupcodeId, { skip: !groupcodeId });
  const optionCount = Array.isArray(groupItems) ? groupItems.length : 0;
  const showOptionsBadge = !!groupcodeId && !isFetching && !isError && optionCount > 1;

  /* values */
  const fabricTypeVal =
    toText(pick(product?.fabricType, product?.fabric_type, product?.category, seoDoc?.fabricType)) || 'Woven Fabrics';
  const contentVal = toText(pick(product?.content, product?.contentName, product?.content_label, seoDoc?.content));
  const gsm = Number(pick(product?.gsm, product?.weightGsm, product?.weight_gsm));
  const ozs = Number(pick(product?.ozs, product?.oz)); // New API uses 'ozs' field
  const weightVal = isFinite(gsm) && gsm > 0 ? `${round(gsm)} gsm / ${round(gsmToOz(gsm))} oz` : 
                   isFinite(ozs) && ozs > 0 ? `${round(gsmToOz(ozs * 34))} gsm / ${round(ozs)} oz` : // Convert ozs back to gsm for display
                   toText(product?.weight);
  const designVal = toText(pick(product?.design, product?.designName, seoDoc?.design));
  const colorsVal = toText(pick(product?.colors, product?.color, product?.colorName, seoDoc?.colors));
  const widthCm = Number(pick(product?.widthCm, product?.width_cm, product?.width, product?.cm));
  const widthInch = Number(pick(product?.widthInch, product?.width_inch, product?.inch));
  const widthVal = isFinite(widthCm) && widthCm > 0 ? `${round(widthCm,0)} cm / ${round(cmToInch(widthCm),0)} inch` : 
                  isFinite(widthInch) && widthInch > 0 ? `${round(widthInch * 2.54,0)} cm / ${round(widthInch,0)} inch` :
                  toText(product?.widthLabel);
  const finishVal = toText(pick(product?.finish, product?.subfinish?.name, product?.finishName, seoDoc?.finish));
  const structureVal = toText(pick(product?.structure, product?.substructure?.name, product?.structureName, seoDoc?.structure));
  const motifVal = toText(pick(product?.motif, product?.motifName, seoDoc?.motif));
  const leadTimeVal = toText(pick(product?.leadTime, product?.lead_time, seoDoc?.leadTime));

  const details = uniq(
    [fabricTypeVal, contentVal, weightVal, designVal, colorsVal, widthVal, finishVal, structureVal, motifVal, leadTimeVal]
      .filter((v) => nonEmpty(v) && !isNoneish(v))
  );

  const mid = Math.ceil(details.length / 2);
  const leftDetails = details.slice(0, mid);
  const rightDetails = details.slice(mid);

  const showCategory =
    categoryLabel &&
    String(categoryLabel).trim().toLowerCase() !== String(fabricTypeVal).trim().toLowerCase();

  /* select from slices */
  const cartItems = useSelector((s) => s.cart?.cart_products || []);
  const wishlistItems = useSelector((s) => s.wishlist?.wishlist || []);

  const inCartReal = cartItems.some((it) => String(getAnyId(it)) === String(productId));
  const inCart = inCartReal || optimisticInCart;
  const inWishlist = wishlistItems.some((it) => String(getAnyId(it)) === String(productId));

  /* ✅ ABOVE-THE-FOLD FIX:
     First few cards use priority => not lazy above fold */
  const isAboveFold = index < 4;

  /* ADD TO CART */
  const handleAddProduct = async (prd, e) => {
    e?.stopPropagation?.(); e?.preventDefault?.();
    if (addingCart) return;
    setAddingCart(true);

    try {
      const baseItem = buildCartItem(prd, { qty: 1 });

      const mapped = (typeof formatProductForCart === 'function')
        ? { ...baseItem, ...formatProductForCart(prd) }
        : baseItem;

      if (!userId) {
        router.push('/login');
        return;
      }

      await dispatch(add_to_cart({ userId, productId: mapped.productId, quantity: mapped.qty })).unwrap();
      await dispatch(fetch_cart_products({ userId }));

      setOptimisticInCart(true);
      dispatch(openCartMini());
      setShowActions(true);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlistProduct = async (prd, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!userId) {
      router.push('/login');
      return;
    }

    const formatted = (typeof formatProductForWishlist === 'function')
      ? formatProductForWishlist(prd)
      : { product: prd, productId: getAnyId(prd) };

    try {
      await dispatch(toggleWishlistItem({ userId, product: formatted })).unwrap();
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    }
  };

  const openQuickView = async (prd, e) => {
    e?.preventDefault?.(); e?.stopPropagation?.();

    let productWithGroupCode = { ...prd };

    if (prd.groupcode && typeof prd.groupcode === 'object' && prd.groupcode._id && !prd.groupcode.img) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

        const response = await fetch(`${API_BASE}/groupcode/`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        });

        if (response.ok) {
          const groupCodeResponse = await response.json();
          const groupCodes = groupCodeResponse.data || [];
          const fullGroupCode = groupCodes.find(gc => gc._id === prd.groupcode._id);
          if (fullGroupCode) productWithGroupCode.groupcode = fullGroupCode;
        }
      } catch { /* ignore */ }
    }

    dispatch(handleProductModal(productWithGroupCode));
  };

  /* 🔎 global search visibility */
  const isVisible = useMemo(() => {
    const query = (q || '').trim();
    if (query.length < 2) return true;
    const fields = [
      () => titleText,
      () => slug || '',
      () => categoryLabel || '',
      () => details.join(' '),
      () => fabricTypeVal || '',
      () => designVal || '',
      () => colorsVal || '',
    ];
    const pred = buildSearchPredicate(query, fields, { mode: 'AND', normalize: true });
    return pred(product);
  }, [q, titleText, slug, categoryLabel, details, fabricTypeVal, designVal, colorsVal, product]);

  if (!isVisible) return null;

  return (
    <div className="product-col">
      <div
        className={`fashion-product-card ${showActions ? 'show-actions' : ''}`}
        onMouseEnter={() => supportsHover && setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onTouchStart={() => setShowActions(true)}
      >
        <div className="card-wrapper">
          <div className="product-image-container">
            <Link
              href={`/fabric/${slug}`}
              aria-label={`View ${titleText}`}
              className="image-link"
              onClick={(e) => {
                if (!supportsHover && !showActions) {
                  e.preventDefault();
                  setShowActions(true);
                }
              }}
            >
              <div className="image-wrapper">
                {/* ✅ FIX: width/height + title + (priority for above fold) */}
                <Image
                  src={imageUrl}
                  alt={titleText}
                  title={titleText}
                  width={800}
                  height={800}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
                  className="img-main"
                  {...(isAboveFold ? { priority: true } : { loading: 'lazy' })}
                />
                <div className="image-overlay" />
              </div>
            </Link>

            {showOptionsBadge && (
              <button
                type="button"
                className="options-ribbon"
                onClick={() => router.push(`/fabric/${slug}`)}
                aria-label={`${optionCount} options for ${titleText}`}
                title={`${optionCount} options`}
              >
                <span className="ribbon-inner">
                  <span className="ribbon-icon" aria-hidden="true">
                    <Image
                      src="/assets/img/product/icons/tshirt.svg"
                      alt="Options"
                      title="Options"
                      width={20}
                      height={20}
                      className="badge-icon"
                      loading="lazy"
                    />
                  </span>
                  <span className="ribbon-text"><strong>{optionCount}</strong> Options</span>
                </span>
              </button>
            )}

            <div className="product-actions">
              <button
                type="button"
                onClick={(e) => handleAddProduct(product, e)}
                className={`action-button ${inCart ? 'active cart-active' : ''}`}
                aria-label={inCart ? 'In cart' : 'Add to cart'}
                aria-pressed={inCart}
                title={inCart ? 'Added to cart' : 'Add to cart'}
                disabled={addingCart}
              >
                {inCart ? <CartActive /> : <Cart />}
              </button>

              <button
                type="button"
                onClick={(e) => handleWishlistProduct(product, e)}
                className={`action-button ${inWishlist ? 'active wishlist-active' : ''}`}
                aria-label={inWishlist ? 'In wishlist' : 'Add to wishlist'}
                aria-pressed={inWishlist}
                title={inWishlist ? 'Added to wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? <WishlistActive /> : <Wishlist />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e?.stopPropagation?.(); e?.preventDefault?.();
                  const url = (typeof window !== 'undefined'
                    ? `${window.location.origin}/fabric/${slug}`
                    : `/fabric/${slug}`);
                  const title = titleText;
                  const text = 'Check out this fabric on Amrita Global Enterprises';
                  (async () => {
                    try {
                      if (navigator?.share) await navigator.share({ title, text, url });
                      else if (navigator?.clipboard) {
                        await navigator.clipboard.writeText(url);
                        alert('Link copied!');
                      } else {
                        prompt('Copy link', url);
                      }
                    } catch {/* ignore */}
                  })();
                }}
                className="action-button"
                aria-label="Share product"
                title="Share"
              >
                <Share />
              </button>

              <button
                type="button"
                onClick={(e) => openQuickView(product, e)}
                className="action-button"
                aria-label="Quick view"
                title="Quick view"
              >
                <QuickView />
              </button>
            </div>
          </div>

          <div className="product-info">
            {showCategory ? <div className="product-category">{categoryLabel}</div> : null}

            <h3 className="product-title">
              <Link href={`/fabric/${slug}`} title={titleText}>
                <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
              </Link>
            </h3>

            {details.length ? (
              <div className="spec-columns">
                <ul className="spec-col">
                  {leftDetails.map((v, i) => (
                    <li key={i} className="spec-row" title={v}>
                      <span className="spec-value">{v}</span>
                    </li>
                  ))}
                </ul>
                <ul className="spec-col">
                  {rightDetails.map((v, i) => (
                    <li key={i} className="spec-row" title={v}>
                      <span className="spec-value">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.products-grid){
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
          gap:16px; margin:0; padding:0; width:100%;
        }
        @media (min-width: 768px) {
          :global(.products-grid){
            grid-template-columns:repeat(4,1fr);
          }
        }
        :global(.products-grid .product-col){ width:100%; min-width:0; }

        .fashion-product-card{
          --primary: var(--tp-theme-primary, #2C4C97);
          --secondary: var(--tp-theme-secondary, #D6A74B);
          --text-primary: var(--tp-text-1, #0F2235);
          --text-secondary: var(--tp-text-2, #475569);
          --bg-white: var(--tp-common-white, #ffffff);
          --bg-grey: var(--tp-grey-1, #F7F9FC);
          --border-color: var(--tp-grey-2, #E6ECF2);
          --success: var(--tp-theme-green, #1E824C);
          position:relative; width:100%; height:100%;
          transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fashion-product-card:hover{ 
          transform:translateY(-3px); 
        }
        .card-wrapper{
          background:var(--bg-white);
          border:1px solid var(--border-color);
          border-radius:12px;
          overflow:hidden;
          box-shadow:0 2px 12px rgba(44, 76, 151, 0.08);
          height:100%;
          display:flex;
          flex-direction:column;
          transition:all .3s ease;
        }
        .fashion-product-card:hover .card-wrapper{
          border-color:var(--primary);
          box-shadow:0 4px 20px rgba(44, 76, 151, 0.15);
        }

        .product-image-container{
          position:relative;
          aspect-ratio:1/1;
          width:100%;
          overflow:hidden;
          background-color:#f8f8f8;
        }
        .image-link{ display:block; width:100%; height:100%; }
        .image-wrapper{ position:relative; width:100%; height:100%; }

        /* ✅ With width/height Image, ensure it still fills container */
        :global(.img-main){
          width:100% !important;
          height:100% !important;
          object-fit:cover;
          object-position:center;
          display:block;
        }

        .image-overlay{
          position:absolute; inset:0;
          background:linear-gradient(
            to bottom, 
            rgba(0,0,0,0) 0%, 
            rgba(44, 76, 151, 0.02) 60%,
            rgba(44, 76, 151, 0.06) 100%
          );
          z-index:1;
          pointer-events:none;
          transition:opacity .3s ease;
        }
        .fashion-product-card:hover .image-overlay{
          opacity:0.8;
        }

        .options-ribbon{ 
          position:absolute; left:50%; transform:translateX(-50%); bottom:8px; 
          border:0; background:transparent; cursor:pointer; z-index:3; 
        }
        .ribbon-inner{ 
          display:flex; align-items:center; gap:5px; 
          height:clamp(22px, 5vw, 26px); 
          padding:0 clamp(10px, 2.5vw, 12px); 
          border-radius:13px; 
          background:linear-gradient(135deg, #1E824C 0%, #166534 100%); /* Green theme */
          border:1px solid rgba(255,255,255,0.9); 
          box-shadow:0 3px 10px rgba(30, 130, 76, 0.3); 
          transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter:blur(6px);
        }
        .ribbon-inner:hover{ 
          transform:scale(1.03); 
          box-shadow:0 4px 14px rgba(30, 130, 76, 0.4);
        }
        .ribbon-icon{ 
          display:inline-grid; place-items:center; 
          width:clamp(15px, 4vw, 17px); height:clamp(15px, 4vw, 17px); 
        }
        .badge-icon{ 
          width:100%; height:100%; display:block; 
          filter:brightness(0) invert(1) drop-shadow(0 1px 1px rgba(0,0,0,0.2)); 
        }
        .ribbon-text{ 
          font-size:clamp(10px, 3vw, 12px); font-weight:600; 
          color:#fff; letter-spacing:.2px; line-height:1; 
          text-shadow:0 1px 2px rgba(0,0,0,0.2);
        }
        .ribbon-text strong{ 
          font-weight:700; margin-right:3px; 
          font-size:clamp(11px, 3.2vw, 13px);
        }

        .product-actions{
          position:absolute; top:8px; right:8px;
          display:flex; flex-direction:column; gap:6px;
          opacity:0; transform:translateY(-4px);
          transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index:3;
        }
        @media (max-width: 767px){
          .product-actions{ opacity:1; transform:translateY(0); }
        }
        @media (hover: hover) and (pointer: fine){
          .fashion-product-card:hover .product-actions,
          .fashion-product-card:focus-within .product-actions{ opacity:1; transform:translateY(0); }
        }
        @media (hover: none) and (pointer: coarse){
          .fashion-product-card.show-actions .product-actions{ opacity:1; transform:translateY(0); }
        }
        .fashion-product-card.show-actions .product-actions{ opacity:1; transform:translateY(0); }

        .action-button{ 
          width:28px; height:28px; border-radius:6px; 
          display:grid; place-items:center; 
          background:rgba(255,255,255,.95); 
          backdrop-filter:blur(6px); 
          border:1px solid var(--border-color); 
          box-shadow:0 2px 8px rgba(44, 76, 151, 0.12); 
          transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); 
          cursor:pointer;
        }
        .action-button :global(svg){ 
          width:14px; height:14px; color:var(--text-primary); 
          transition:all .3s ease; 
        }
        .action-button:hover{ 
          background:var(--primary); border-color:var(--primary); 
          box-shadow:0 3px 12px rgba(44, 76, 151, 0.25); 
          transform:scale(1.03) translateY(-1px); 
        }
        .action-button:hover :global(svg){ color:#fff !important; }
        .action-button.cart-active{ 
          background:var(--success); 
          border-color:var(--success); 
        }
        .action-button.cart-active :global(svg){ color:#fff; }
        .action-button.wishlist-active{ 
          background:#ef4444; 
          border-color:#ef4444; 
        }
        .action-button.wishlist-active :global(svg){ color:#fff; }
        .action-button:focus-visible{ 
          outline:2px solid var(--primary); outline-offset:2px; 
        }

        .product-info{
          padding:12px 10px 10px;
          border-top:1px solid var(--border-color);
          background:var(--bg-white);
          flex-grow:1;
          display:flex;
          flex-direction:column;
        }
        .product-category{ 
          display:none; /* Hide category badge */
        }
        .product-title{
          font-family:var(--tp-ff-jost, 'Poppins', sans-serif);
          font-size:15px; font-weight:600; line-height:1.3;
          color:var(--text-primary); margin:0 0 8px;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
          min-height:2.6em;
        }
        .product-title :global(a){ 
          color:inherit; text-decoration:none; 
          transition:color .3s ease;
        }
        .product-title :global(a:hover){ color:var(--primary); }

        .spec-columns{ 
          display:grid; grid-template-columns:1fr 1fr; gap:0 10px; 
          margin-top:6px; flex-grow:1; 
          background:transparent; /* Remove background */
          border-radius:0;
          padding:0; /* Remove padding */
          border:none; /* Remove border */
        }
        @media (max-width:340px){ .spec-columns{ grid-template-columns:1fr; } }
        .spec-col{ list-style:none; margin:0; padding:0; }
        .spec-row{ 
          display:flex; align-items:center; 
          padding:3px 0; 
          border-bottom:1px solid rgba(44, 76, 151, 0.08); 
          min-height:22px; 
          transition:background-color .2s ease;
        }
        .spec-row:last-child{ border-bottom:0; }
        .spec-row:hover{ background-color:rgba(44, 76, 151, 0.02); }
        .spec-value{ 
          font-size:12px; font-weight:500; color:var(--text-secondary); 
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; 
          position:relative;
          text-wrap:auto;
        }
        .spec-value::before{
          content:'•';
          color:var(--secondary);
          font-weight:700;
          margin-right:6px;
        }

        .price-wrapper{ display:none; }
      `}</style>
    </div>
  );
};

export default ProductItem;
