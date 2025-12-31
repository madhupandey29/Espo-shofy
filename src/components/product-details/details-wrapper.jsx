/* ----------------------------------------------------------------------
   components/product-details/details-wrapper.jsx
---------------------------------------------------------------------- */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { useGetSubstructureQuery } from '@/redux/features/substructureApi';
import { useGetContentByIdQuery } from '@/redux/features/contentApi';
import { useGetSubfinishQuery } from '@/redux/features/subfinishApi';
import { useGetSeoByProductQuery } from '@/redux/features/seoApi';
import { useGetDesignByIdQuery } from '@/redux/features/designApi';
import { useGetMotifSizeByIdQuery } from '@/redux/features/motifSizeApi';

import { add_to_wishlist } from '@/redux/features/wishlist-slice';

/* ---------------- small helpers ---------------- */
const nonEmpty = (v) =>
  v !== undefined && v !== null && (typeof v === 'number' || String(v).trim() !== '');
const pick = (...xs) => xs.find(nonEmpty);

const asNumber = (value) => {
  if (value === undefined || value === null) return undefined;
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

const isObjId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);

/* ---------------- lookup mini-components ---------------- */
const StructureInfo = ({ id }) => {
  const { data, isLoading, isError } = useGetSubstructureQuery(id, { skip: !id });
  const value = !id ? 'N/A' : isLoading ? 'Loading…' : (isError || !data?.data?.name) ? 'N/A' : data.data.name;
  return <span className="fact-value">{value}</span>;
};
const ContentInfo = ({ id }) => {
  const { data, isLoading, isError } = useGetContentByIdQuery(id, { skip: !id });
  const value = !id ? 'N/A' : isLoading ? 'Loading…' : (isError || !data?.data?.name) ? 'N/A' : data.data.name;
  return <span className="fact-value">{value}</span>;
};
const FinishInfo = ({ id }) => {
  const { data, isLoading, isError } = useGetSubfinishQuery(id, { skip: !id });
  const value = !id ? 'N/A' : isLoading ? 'Loading…' : (isError || !data?.data?.name) ? 'N/A' : data.data.name;
  return <span className="fact-value">{value}</span>;
};

/* ---------------- API helpers ---------------- */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_KEY_HEADER = process.env.NEXT_PUBLIC_API_KEY_HEADER || 'x-api-key';

const fetchJson = async (url) => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers[API_KEY_HEADER] = API_KEY;
  const res = await fetch(url, { headers, credentials: 'include' });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const getFirst = (...xs) => xs.find((x) => x !== undefined && x !== null);

const fetchNameViaCandidates = async (candidates) => {
  for (const path of candidates) {
    const data = await fetchJson(`${API_BASE}${path}`);
    const name = getFirst(
      data?.data?.name,
      data?.data?.title,
      data?.data?.size,
      data?.name,
      data?.title
    );
    if (nonEmpty(name)) return String(name);
  }
  return null;
};

/* ----- Stars ----- */
const Stars = ({ value }) => {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const iconStyle = { marginRight: 4, color: '#f59e0b' };
  return (
    <span aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: full }).map((_, i) => <i key={`f${i}`} className="fa-solid fa-star" style={iconStyle} />)}
      {half === 1 && <i className="fa-solid fa-star-half-stroke" style={iconStyle} />}
      {Array.from({ length: empty }).map((_, i) => <i key={`e${i}`} className="fa-regular fa-star" style={iconStyle} />)}
    </span>
  );
};

/* ---------------- Specific resolvers ---------------- */
const useDesignName = (design, designId) => {
  const direct = useMemo(() => {
    if (typeof design === 'object') return design?.name;
    if (typeof design === 'string' && !isObjId(design)) return design;
    return undefined;
  }, [design]);

  const id = useMemo(() => {
    if (typeof design === 'object') return design?._id;
    if (typeof design === 'string' && isObjId(design)) return design;
    if (typeof designId === 'string' && isObjId(designId)) return designId;
    return undefined;
  }, [design, designId]);

  const { data: dQ } = useGetDesignByIdQuery(id, { skip: !id });
  const fromRtk = dQ?.data?.name;

  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!API_BASE || !id || direct || fromRtk) { if (live) setFetched(null); return; }
      const name = await fetchNameViaCandidates([
        `/shopy/designs/${id}`,
        `/designs/${id}`,
        `/design/${id}`,
      ]);
      if (live) setFetched(name);
    })();
    return () => { live = false; };
  }, [id, direct, fromRtk]);

  return pick(direct, fromRtk, fetched);
};

const useMotifName = (motif, motifId) => {
  const direct = useMemo(() => {
    if (typeof motif === 'object') return motif?.name || motif?.size;
    if (typeof motif === 'string' && !isObjId(motif)) return motif;
    return undefined;
  }, [motif]);

  const id = useMemo(() => {
    if (typeof motif === 'object') return motif?._id;
    if (typeof motif === 'string' && isObjId(motif)) return motif;
    if (typeof motifId === 'string' && isObjId(motifId)) return motifId;
    return undefined;
  }, [motif, motifId]);

  const { data: mQ } = useGetMotifSizeByIdQuery(id, { skip: !id });
  const fromRtk = mQ?.data?.name || mQ?.data?.size;

  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!API_BASE || !id || direct || fromRtk) { if (live) setFetched(null); return; }
      const name = await fetchNameViaCandidates([
        `/shopy/motifs/${id}`,
        `/motifs/${id}`,
        `/motif/${id}`,
      ]);
      if (live) setFetched(name);
    })();
    return () => { live = false; };
  }, [id, direct, fromRtk]);

  return pick(direct, fromRtk, fetched);
};

const useColorNames = (colors) => {
  const arr = useMemo(() => {
    if (!colors) return [];
    if (Array.isArray(colors)) return colors;
    if (typeof colors === 'string') return colors.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }, [colors]);

  const givenNames = useMemo(() => arr
    .map((x) => (typeof x === 'string' ? (!isObjId(x) ? x : null) : x?.name))
    .filter(Boolean), [arr]);

  const ids = useMemo(() => arr
    .map((x) => (typeof x === 'string' ? (isObjId(x) ? x : null) : x?._id))
    .filter(Boolean), [arr]);

  const [fetched, setFetched] = useState([]);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!API_BASE || !ids.length) { if (live) setFetched([]); return; }
      const names = await Promise.all(ids.map((id) =>
        fetchNameViaCandidates([`/shopy/colors/${id}`, `/colors/${id}`, `/color/${id}`])
      ));
      const ok = names.filter(Boolean);
      if (live) setFetched(ok);
    })();
    return () => { live = false; };
  }, [JSON.stringify(ids)]);

  return (givenNames.length ? givenNames : fetched);
};

/* ---------------- Main component ---------------- */
const DetailsWrapper = ({ productItem = {} }) => {
  const params = useSearchParams();
  const q = (params?.get('searchText') || '').trim();
  const query = q.toLowerCase();

  const highlight = (text) => {
    const s = String(text || '');
    if (!query) return s;
    try {
      const re = new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig');
      return s.replace(re, '<mark style="background:#fff3bf">$1</mark>');
    } catch {
      return s;
    }
  };

  const {
    _id,
    title,
    category,
    newCategoryId,
    description,
    status,
    slug,
    leadtime,

    structureId,
    contentId,
    finishId,

    design, designId,
    motif, motifId,

    color, colors,

    gsm, oz, cm, inch, width,
  } = productItem;

  // Extract leadtime for display
  const leadtimeDisplay = Array.isArray(leadtime) && leadtime.length > 0 
    ? leadtime[0] 
    : status || 'In Stock';

  /* ✅ Fetch product details for shortProductDescription (and other fields if needed) */
  const [productFull, setProductFull] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!API_BASE || !slug) { if (live) setProductFull(null); return; }
      const json = await fetchJson(`${API_BASE}/product/slug/${slug}`);
      const data = json?.data || null;
      if (live) setProductFull(data);
    })();
    return () => { live = false; };
  }, [slug]);

  // ✅ Short description (prefer API field, fallback to existing description)
  const shortDescHtml = pick(productFull?.shortProductDescription);

  /* SEO: lead time / rating / reviews */
  const { data: seoResp } = useGetSeoByProductQuery(_id, { skip: !_id });
  const seoDoc = Array.isArray(seoResp?.data) ? seoResp?.data?.[0] : (seoResp?.data || seoResp);
  const leadTimeDays = pick(seoDoc?.leadtime);
  const ratingValue = pick(seoDoc?.rating_value);
  const ratingCount = pick(seoDoc?.rating_count);

  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const isInWishlist = wishlist.some((prd) => prd._id === _id);
  const toggleWishlist = () => dispatch(add_to_wishlist(productItem));

  /* Computed fields */
  const weightParts = [];
  if (nonEmpty(gsm)) weightParts.push(`${gsm} gsm`);
  if (nonEmpty(oz)) weightParts.push(`${Number(oz).toFixed(1)} oz`);
  const weightDisplay = weightParts.join(' / ') || 'N/A';

  const cmNum = asNumber(cm ?? width);
  const inchNum = asNumber(inch);
  const widthDisplay = [
    cmNum != null ? `${cmNum} cm` : undefined,
    inchNum != null ? `${Math.round(inchNum)} inch` : undefined,
  ].filter(Boolean).join(' / ') || 'N/A';

  const designName = useDesignName(design, designId);
  const motifName = useMotifName(motif || productItem?.motifsize, motifId);
  const colorNames = useColorNames(Array.isArray(color) ? color : (Array.isArray(colors) ? colors : []));

  return (
    <div className="product-details-modern-wrapper">
      {/* Header Section */}
      <div className="product-header">
        <div className="product-category">
          <span className="category-badge">{category?.name || newCategoryId?.name}</span>
          <span className="stock-badge">{leadtimeDisplay}</span>
        </div>
        
        <h1 className="product-title" dangerouslySetInnerHTML={{ __html: highlight(title) }} />
        
        {/* Short Description */}
        {nonEmpty(shortDescHtml) ? (
          <div className="product-description" dangerouslySetInnerHTML={{ __html: shortDescHtml }} />
        ) : (
          <p className="product-description" dangerouslySetInnerHTML={{ __html: highlight(description) }} />
        )}
      </div>

      {/* Quick Facts Grid */}
      <div className="quick-facts-section">
        <div className="facts-grid">
          <div className="fact-item">
            <span className="fact-label">Content</span>
            <ContentInfo id={contentId} />
          </div>
          <div className="fact-item">
            <span className="fact-label">Width</span>
            <span className="fact-value">{widthDisplay}</span>
          </div>
          <div className="fact-item">
            <span className="fact-label">Weight</span>
            <span className="fact-value">{weightDisplay}</span>
          </div>
          <div className="fact-item">
            <span className="fact-label">Finish</span>
            <FinishInfo id={finishId} />
          </div>
          <div className="fact-item">
            <span className="fact-label">Design</span>
            <span className="fact-value">{designName || 'N/A'}</span>
          </div>
          <div className="fact-item">
            <span className="fact-label">Structure</span>
            <StructureInfo id={structureId} />
          </div>
          <div className="fact-item">
            <span className="fact-label">Colors</span>
            <span className="fact-value">{(colorNames && colorNames.length) ? colorNames.join(', ') : 'N/A'}</span>
          </div>
          <div className="fact-item">
            <span className="fact-label">Motif</span>
            <span className="fact-value">{motifName || 'N/A'}</span>
          </div>
          <div className="fact-item">
            <span className="fact-label">Rating</span>
            <div className="fact-value"><Stars value={ratingValue} /></div>
          </div>
          <div className="fact-item">
            <span className="fact-label">Lead time</span>
            <span className="fact-value">{nonEmpty(leadTimeDays) ? `${leadTimeDays} days` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <div className="action-buttons">
          <button className="action-btn primary">
            <i className="fa-regular fa-file-lines"></i>
            <span className="btn-text">Request Sample</span>
          </button>
          <button className="action-btn secondary">
            <i className="fa-regular fa-comment-dots"></i>
            <span className="btn-text">Request Quote</span>
          </button>
          <button
            type="button"
            onClick={toggleWishlist}
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            aria-label="Add to Wishlist"
          >
            <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .product-details-modern-wrapper {
          padding: 0 0 20px 0;
          height: fit-content;
        }

        /* Header Section - Balanced */
        .product-header {
          margin-bottom: 20px;
        }

        .product-category {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .category-badge {
          display: inline-block;
          padding: 5px 10px;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 14px;
          font-family: var(--tp-ff-jost);
        }

        .stock-badge {
          display: inline-block;
          padding: 5px 10px;
          background: var(--tp-theme-green);
          color: var(--tp-common-white);
          font-size: 11px;
          font-weight: 600;
          text-transform: lowercase;
          border-radius: 14px;
          font-family: var(--tp-ff-jost);
        }

        .product-title {
          font-family: var(--tp-ff-jost);
          font-size: 28px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin: 0 0 12px 0;
          line-height: 1.2;
        }

        .product-description {
          font-family: var(--tp-ff-roboto);
          font-size: 15px;
          line-height: 1.5;
          color: var(--tp-text-2);
          margin: 0 0 20px 0;
        }

        /* Quick Facts Section - Balanced */
        .quick-facts-section {
          background: var(--tp-grey-1);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid var(--tp-grey-2);
        }

        .facts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 14px;
        }

        .fact-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid var(--tp-grey-2);
        }

        .fact-item:last-child {
          border-bottom: none;
        }

        .fact-label {
          font-family: var(--tp-ff-jost);
          font-size: 12px;
          font-weight: 600;
          color: var(--tp-text-2);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          min-width: 70px;
        }

        .fact-value {
          font-family: var(--tp-ff-roboto);
          font-size: 13px;
          font-weight: 500;
          color: var(--tp-text-1);
          text-align: right;
          flex: 1;
        }

        /* Action Section - Improved for mobile */
        .action-section {
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 10px;
          border: none;
          border-radius: 10px;
          font-family: var(--tp-ff-jost);
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          cursor: pointer;
          min-height: 50px;
        }

        .action-btn i {
          font-size: 16px;
          flex-shrink: 0;
        }

        .btn-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .action-btn.primary {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
        }

        .action-btn.primary:hover {
          background: var(--tp-theme-1);
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: var(--tp-theme-secondary);
          color: var(--tp-theme-primary);
          border: 1px solid var(--tp-theme-primary);
        }

        .action-btn.secondary:hover {
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          border: 2px solid var(--tp-theme-primary);
          transform: translateY(-1px);
        }

        .wishlist-btn {
          width: 50px;
          min-width: 50px;
          height: 50px;
          background: var(--tp-common-white);
          border: 2px solid var(--tp-grey-3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: var(--tp-text-2);
          transition: all 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .wishlist-btn:hover {
          border-color: var(--tp-theme-primary);
          color: var(--tp-theme-primary);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .wishlist-btn.active {
          background: var(--tp-theme-primary);
          border-color: var(--tp-theme-primary);
          color: var(--tp-common-white);
          box-shadow: 0 4px 12px rgba(var(--tp-theme-primary-rgb), 0.3);
        }

        /* Responsive Design - Improved for mobile buttons */
        @media (max-width: 768px) {
          .product-title {
            font-size: 20px;
            line-height: 1.3;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          .facts-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          /* Improved mobile button layout */
          .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 8px;
            align-items: stretch;
          }

          .action-btn {
            min-height: 44px;
            padding: 10px 8px;
            font-size: 11px;
            gap: 4px;
            width: 100%;
            overflow: hidden;
          }

          .action-btn i {
            font-size: 14px;
          }

          .btn-text {
            font-size: 11px;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .wishlist-btn {
            width: 44px;
            min-width: 44px;
            height: 44px;
            font-size: 16px;
            align-self: stretch;
          }
          
          .fact-label {
            min-width: 60px;
            font-size: 11px;
          }
          
          .fact-value {
            font-size: 12px;
          }
        }

        @media (max-width: 640px) {
          /* Stack layout for very small screens */
          .action-buttons {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .wishlist-btn {
            width: 100%;
            min-width: auto;
            height: 44px;
            margin-top: 5px;
          }
        }

        @media (max-width: 480px) {
          .product-title {
            font-size: 18px;
            line-height: 1.25;
          }

          .quick-facts-section {
            padding: 10px;
          }

          /* Compact three-column layout for small phones */
          .action-buttons {
            grid-template-columns: 1fr 1fr auto;
            gap: 6px;
          }

          .action-btn {
            min-height: 40px;
            padding: 8px 6px;
            font-size: 10px;
            gap: 3px;
          }

          .action-btn i {
            font-size: 12px;
          }

          .btn-text {
            font-size: 10px;
          }

          .wishlist-btn {
            width: 40px;
            min-width: 40px;
            height: 40px;
            font-size: 14px;
          }
          
          .fact-label {
            min-width: 50px;
            font-size: 10px;
          }
          
          .fact-value {
            font-size: 11px;
          }
        }

        /* Alternative: Icon-only buttons for very small screens */
        @media (max-width: 360px) {
          .action-btn {
            padding: 8px 4px;
          }
          
          .btn-text {
            display: none;
          }
          
          .action-btn i {
            margin: 0;
            font-size: 14px;
          }
          
          .wishlist-btn {
            width: 36px;
            min-width: 36px;
            height: 36px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailsWrapper;