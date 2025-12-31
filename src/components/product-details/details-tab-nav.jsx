/* ---------------------------------------------------------------------- */
/*  details-tab-nav.jsx – Description / Additional-info / FAQ tabs         */
/* ---------------------------------------------------------------------- */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useGetSubstructureQuery }   from '@/redux/features/substructureApi';
import { useGetSubfinishQuery }      from '@/redux/features/subfinishApi';
import { useGetSubsuitableQuery }    from '@/redux/features/subsuitableApi';
import { useGetContentByIdQuery }    from '@/redux/features/contentApi';
import { useGetDesignByIdQuery }     from '@/redux/features/designApi';
import { useGetMotifSizeByIdQuery }  from '@/redux/features/motifSizeApi';
import { useGetCategoryByIdQuery }   from '@/redux/features/categoryApi';
import { useGetSeoByProductQuery }   from '@/redux/features/seoApi';
import { useGetSingleProductQuery }  from '@/redux/features/productApi';

// ✅ FAQ API
import { useGetAllFaqAQuery } from '@/redux/features/faqaApi';



/* ───── helpers ───── */
const nonEmpty = (v) => {
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && (typeof v === 'number' || String(v).trim() !== '');
};
const pick  = (...xs) => xs.find(nonEmpty);
const money = (n) => (typeof n === 'number' ? `₹ ${n.toLocaleString('en-IN')}` : undefined);

/* normalize any shape -> array of strings */
const toNameArray = (raw) => {
  const src = raw ?? [];
  if (Array.isArray(src)) {
    return src
      .map((item) => {
        if (item == null) return '';
        if (typeof item === 'string' || typeof item === 'number') return String(item);
        return item.name ?? item.label ?? item.value ?? item.colorName ?? item.colour ?? '';
      })
      .filter((s) => s && String(s).trim() !== '');
  }
  if (typeof src === 'object') {
    const v = src.name ?? src.label ?? src.value ?? src.colorName ?? src.colour;
    return v ? [String(v)] : [];
  }
  return String(src).trim() ? [String(src)] : [];
};

const looksLikeIdArray = (raw) =>
  Array.isArray(raw) && raw.length > 0 && raw.every((x) => typeof x === 'string' && x.length >= 12);

const stripHtml = (html) => String(html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/* ---------- modern pill UI ---------- */
function ValuePill({ value, unit, title }) {
  return (
    <span className="value-pill" title={title}>
      <span className="pill-value">{value}</span>
      {unit && <span className="pill-unit">{unit}</span>}
      
      <style jsx>{`
        .value-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid var(--tp-grey-2);
          border-radius: 24px;
          font-family: var(--tp-ff-roboto);
          font-size: 14px;
          font-weight: 500;
          color: var(--tp-text-1);
          transition: all 0.2s ease;
        }

        .value-pill:hover {
          background: var(--tp-common-white);
          border-color: var(--tp-theme-primary);
          box-shadow: 0 2px 8px rgba(44, 76, 151, 0.1);
        }

        .pill-value {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
        }

        .pill-unit {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border-radius: 12px;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .value-pill {
            font-size: 13px;
            padding: 6px 12px;
          }

          .pill-unit {
            font-size: 11px;
            padding: 3px 6px;
          }
        }
      `}</style>
    </span>
  );
}

function renderValue(value) {
  if (Array.isArray(value)) {
    return (
      <div className="value-pills-container">
        {value.map((item, i) =>
          typeof item === 'object' && item && ('v' in item || 'unit' in item)
            ? <ValuePill key={i} value={item.v ?? item.value} unit={item.unit} />
            : <ValuePill key={i} value={item} />
        )}
        
        <style jsx>{`
          .value-pills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }

          @media (max-width: 768px) {
            .value-pills-container {
              gap: 6px;
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <span className="simple-value">
      {String(value)}
      
      <style jsx>{`
        .simple-value {
          font-family: var(--tp-ff-roboto);
          font-size: 14px;
          color: var(--tp-text-2);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .simple-value {
            font-size: 13px;
          }
        }
      `}</style>
    </span>
  );
}

/* ---------- FAQ renderer ---------- */
function FaqBlock({ items = [] }) {
  if (!items.length) {
    return (
      <div className="no-faqs">
        <p>No FAQs available at the moment.</p>
        <style jsx>{`
          .no-faqs {
            text-align: center;
            padding: 40px 20px;
            border-radius: 12px;
            border: 1px dashed var(--tp-grey-2);
          }
          .no-faqs p {
            margin: 0;
            font-size: 16px;
            color: var(--tp-text-2);
            font-family: var(--tp-ff-roboto);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="faq-container">
      {items.map((it, idx) => (
        <details key={it.key || idx} className="faq-item">
          <summary className="faq-question">
            <span className="question-text">
              {it.questionIsHtml ? (
                <span dangerouslySetInnerHTML={{ __html: it.question }} />
              ) : (
                it.question
              )}
            </span>
            <span className="faq-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          </summary>

          <div className="faq-answer">
            {it.answerIsHtml ? (
              <div dangerouslySetInnerHTML={{ __html: it.answer }} />
            ) : (
              <p>{it.answer}</p>
            )}
          </div>
        </details>
      ))}

      <style jsx>{`
        .faq-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          border: 1px solid var(--tp-grey-2);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-item:hover {
          border-color: var(--tp-theme-primary);
          box-shadow: 0 4px 12px rgba(44, 76, 151, 0.1);
        }

        .faq-item[open] {
          background: var(--tp-common-white);
          border-color: var(--tp-theme-primary);
          box-shadow: 0 4px 16px rgba(44, 76, 151, 0.15);
        }

        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          cursor: pointer;
          font-family: var(--tp-ff-jost);
          font-size: 16px;
          font-weight: 600;
          color: var(--tp-text-1);
          list-style: none;
          transition: all 0.3s ease;
        }

        .faq-question::-webkit-details-marker {
          display: none;
        }

        .faq-question:hover {
          color: var(--tp-theme-primary);
        }

        .question-text {
          flex: 1;
          padding-right: 16px;
        }

        .faq-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .faq-item[open] .faq-icon {
          background: var(--tp-theme-secondary);
          transform: rotate(45deg);
        }

        .faq-answer {
          padding: 0 24px 24px 24px;
          font-family: var(--tp-ff-roboto);
          font-size: 15px;
          line-height: 1.6;
          color: var(--tp-text-2);
          animation: fadeIn 0.3s ease-out;
        }

        .faq-answer p {
          margin: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .faq-question {
            padding: 16px 20px;
            font-size: 15px;
          }

          .faq-answer {
            padding: 0 20px 20px 20px;
            font-size: 14px;
          }

          .faq-icon {
            width: 28px;
            height: 28px;
          }

          .question-text {
            padding-right: 12px;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
export default function DetailsTabNav({ product = {} }) {
  const {
    description,
    productdescription,
    price,
    um, currency, quantity,
    categoryId, structureId, contentId, finishId,
    designId, motifsizeId, suitableforId,
    category, substructure, content, design, subfinish, motif,
    slug, _id,
  } = product;

  /* ─── SEO for SKU ─── */
  const { data: seoResp } = useGetSeoByProductQuery(_id, { skip: !_id });
  const seoDoc = Array.isArray(seoResp?.data) ? seoResp?.data?.[0] : (seoResp?.data || seoResp);
  const seoSku = pick(
    seoDoc?.identifier,
    seoDoc?.sku,
    seoDoc?.productIdentifier,
    seoDoc?.productCode,
    seoDoc?.code
  );
  const skuValue = pick(seoSku);
  const skuDisplay = nonEmpty(skuValue) ? skuValue : 'Not available';

  /* ─── FALLBACK fetches when product prop is missing fields ─── */
  const needsColor       = !(Array.isArray(product?.color) && product.color.length);
  const needsSubsuitable = !(Array.isArray(product?.subsuitable) || product?.subsuitable?.name);

  const { data: singleResp } = useGetSingleProductQuery(_id, {
    skip: !_id || (!needsColor && !needsSubsuitable),
  });
  const singleById = singleResp?.data || singleResp?.product || singleResp;

  const [singleBySlug, setSingleBySlug] = useState(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_KEY  = process.env.NEXT_PUBLIC_API_KEY;

  useEffect(() => {
    let cancel = false;
    async function fetchBySlug() {
      if (!slug) return;
      try {
        const res = await fetch(`${API_BASE}/product/slug/${slug}`, {
          headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancel) setSingleBySlug(json?.data || null);
      } catch (_) {
        if (!cancel) setSingleBySlug(null);
      }
    }
    if ((needsColor || needsSubsuitable) && !singleById && slug) fetchBySlug();
    return () => { cancel = true; };
  }, [slug, needsColor, needsSubsuitable, singleById, API_BASE, API_KEY]);

  const full = singleById || singleBySlug || {};

  // ✅ FIXED: fullDescription must be AFTER `full` exists
  const fullDescription = pick(
    product?.fullProductDescription,
    full?.fullProductDescription,
    description,
    productdescription
  ) || '';

  /* ─── COLOR resolve ─── */
  const rawColor = product?.color ?? full?.color;
  const immediateColorNames = toNameArray(rawColor);

  const [resolvedColorNames, setResolvedColorNames] = useState([]);
  useEffect(() => {
    let cancel = false;
    async function hydrateFromIds(ids) {
      try {
        const uniq = [...new Set(ids)];
        const reqs = uniq.map((id) =>
          fetch(`${API_BASE}/color/${id}`, {
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            credentials: 'include',
          }).then(r => (r.ok ? r.json() : null))
        );
        const results = await Promise.all(reqs);
        const names = results?.map(r => r?.data?.name).filter(Boolean) || [];
        if (!cancel) setResolvedColorNames(names);
      } catch (_) {
        if (!cancel) setResolvedColorNames([]);
      }
    }

    if (immediateColorNames.length === 0 && looksLikeIdArray(rawColor)) hydrateFromIds(rawColor);
    else setResolvedColorNames([]);

    return () => { cancel = true; };
  }, [API_BASE, API_KEY, rawColor, immediateColorNames.length]);

  const colorNames = immediateColorNames.length ? immediateColorNames : resolvedColorNames;

  /* ─── SUBSUITABLE normalize ─── */
  const subsuitableNames = toNameArray(product?.subsuitable ?? full?.subsuitable);

  /* ─── lookups ─── */
  const { data: catL    } = useGetCategoryByIdQuery(categoryId,   { skip: !categoryId });
  const { data: subL    } = useGetSubstructureQuery(structureId,  { skip: !structureId });
  const { data: contL   } = useGetContentByIdQuery(contentId,     { skip: !contentId });
  const { data: finL    } = useGetSubfinishQuery(finishId,        { skip: !finishId });
  const { data: desL    } = useGetDesignByIdQuery(designId,       { skip: !designId });
  const { data: motifL  } = useGetMotifSizeByIdQuery(motifsizeId, { skip: !motifsizeId });
  const { data: suitL   } = useGetSubsuitableQuery(suitableforId, { skip: !suitableforId });

  const categoryName      = pick(category?.name,      catL?.data?.name);
  const substructureName  = pick(substructure?.name,  subL?.data?.name);
  const contentName       = pick(content?.name,       contL?.data?.name);
  const subfinishName     = pick(subfinish?.name,     finL?.data?.name);
  const designName        = pick(design?.name,        desL?.data?.name);
  const motifName         = pick(motif?.name,         motifL?.data?.name, motifL?.data?.size);
  const subsuitableNameFB = pick(suitL?.data?.name);



  /* ---------- WIDTH ---------- */
  const cmSrc   = nonEmpty(product?.cm)   ? product.cm   : (nonEmpty(full?.cm)   ? full.cm   : (nonEmpty(product?.width) ? product.width : undefined));
  const inchSrc = nonEmpty(product?.inch) ? product.inch : (nonEmpty(full?.inch) ? full.inch : undefined);

  const cmRaw   = nonEmpty(cmSrc)   ? Number(cmSrc)   : undefined;
  const inchRaw = nonEmpty(inchSrc) ? Number(inchSrc) : undefined;

  const cmFinal   = Number.isFinite(cmRaw)   ? cmRaw   : (Number.isFinite(inchRaw) ? inchRaw * 2.54 : undefined);
  const inchFinal = Number.isFinite(inchRaw) ? inchRaw : (Number.isFinite(cmRaw)   ? cmRaw / 2.54   : undefined);

  const fmt = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toString();

  const widthPills = [
    Number.isFinite(cmFinal)   ? { v: fmt(cmFinal, 0), unit: 'cm' }     : null,
    Number.isFinite(inchFinal) ? { v: fmt(inchFinal, 2), unit: 'inch' } : null,
  ].filter(Boolean);

  const widthDisplay = widthPills.length > 0 ? widthPills : 'Not available';

  /* ---------- WEIGHT ---------- */
  const weightPills = [
    nonEmpty(product?.gsm ?? full?.gsm) ? { v: (product?.gsm ?? full?.gsm), unit: 'GSM' } : null,
    nonEmpty(product?.oz  ?? full?.oz ) ? { v: (product?.oz  ?? full?.oz ), unit: 'OZ'  } : null,
  ].filter(Boolean);

  const weightDisplay = weightPills.length > 0 ? weightPills : 'Not available';

  /* rows */
  const rowsBase = [
    { label: 'Price',          value: money(price) },
    { label: 'Width',          value: widthDisplay },
    { label: 'Weight',         value: weightDisplay },
    { label: 'U/M',            value: um },
    { label: 'Currency',       value: currency },
    { label: 'Quantity',       value: quantity },
    { label: 'Category',       value: categoryName },
    { label: 'Sub-structure',  value: substructureName },
    { label: 'Content',        value: contentName },
    { label: 'Sub-finish',     value: subfinishName },
    { label: 'Design',         value: designName },
    { label: 'Motif',          value: motifName },
  ].filter((r) => nonEmpty(r.value));

  const rows = [
    { label: 'Color',        value: (colorNames.length ? colorNames.map(c => ({ v: c })) : ['—']) },
    { label: 'Suitable For', value: ((subsuitableNames.length ? subsuitableNames
                                 : (subsuitableNameFB ? [subsuitableNameFB] : [])) || ['—']).map(s => ({ v: s })) },
    ...rowsBase,
    { label: 'SKU',          value: skuDisplay },
  ];

  const half = Math.ceil(rows.length / 2);

  /* ---------------- FAQ data (product + global) ---------------- */
  const { data: faqaResp } = useGetAllFaqAQuery();
  const globalFaqsRaw = Array.isArray(faqaResp?.data) ? faqaResp.data : [];

  const productFaqs = useMemo(() => {
    const src = full && Object.keys(full).length ? full : product;
    const items = [];
    for (let i = 1; i <= 6; i++) {
      const q = src?.[`productquestion${i}`];
      const a = src?.[`productanswer${i}`];
      if (!nonEmpty(q) || !nonEmpty(a)) continue;

      const qStr = String(q);
      const aStr = String(a);

      items.push({
        key: `p-${i}`,
        question: qStr,
        answer: aStr,
        questionIsHtml: /<[a-z][\s\S]*>/i.test(qStr),
        answerIsHtml: /<[a-z][\s\S]*>/i.test(aStr),
      });
    }
    return items;
  }, [product, full]);

  const globalFaqs = useMemo(() => {
    return globalFaqsRaw
      .map((f) => {
        const qStr = String(f?.question || '');
        const aStr = String(f?.answer || '');
        if (!nonEmpty(qStr) || !nonEmpty(aStr)) return null;
        return {
          key: f?._id || stripHtml(qStr).slice(0, 24),
          question: qStr,
          answer: aStr,
          questionIsHtml: /<[a-z][\s\S]*>/i.test(qStr),
          answerIsHtml: /<[a-z][\s\S]*>/i.test(aStr),
        };
      })
      .filter(Boolean);
  }, [globalFaqsRaw]);

  const mergedFaqs = useMemo(() => [...productFaqs, ...globalFaqs], [productFaqs, globalFaqs]);

  return (
    <div className="product-details-modern">
      {/* Main Content Section */}
      <div className="hero-section">
        <div className="container-fluid">
          <div className="row">
            {/* Left Column: Description + Specifications */}
            <div className="col-lg-8 col-md-7">
              <div className="description-panel">
                {/* Description Section */}
                <div className="panel-header">
                  <span className="badge">Product Overview</span>
                  <h2 className="panel-title">Description</h2>
                </div>
                <div className="description-body">
                  {/<[a-z][\s\S]*>/i.test(fullDescription)
                    ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: fullDescription }} />
                    : <p className="simple-content">{fullDescription || 'No description available for this product.'}</p>}
                </div>

                {/* Specifications Section */}
                <div className="specs-divider"></div>
                <div className="specs-header-inline">
                  <span className="badge">Technical Details</span>
                  <h3 className="specs-title">Product Specifications</h3>
                </div>
                
                <div className="specs-table">
                  {rows.map(({ label, value }, index) => (
                    <div key={label} className="spec-row-compact">
                      <div className="spec-label-compact">{label}</div>
                      <div className="spec-value-compact">{renderValue(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column: FAQ */}
            <div className="col-lg-4 col-md-5">
              <div className="faq-panel">
                <div className="panel-header">
                  <span className="badge">Support</span>
                  <h2 className="panel-title">FAQ</h2>
                </div>
                <div className="faq-body">
                  <FaqBlock items={mergedFaqs} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-details-modern {
          margin-top: 40px;
        }

        .hero-section {
          padding: 32px 0;
        }

        .hero-section .row {
          align-items: flex-start;
        }

        .description-panel, .faq-panel {
          background: var(--tp-common-white);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(15, 34, 53, 0.06);
          border: 1px solid var(--tp-grey-2);
        }

        .faq-panel {
          height: fit-content;
        }

        .panel-header {
          margin-bottom: 20px;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 12px;
          margin-bottom: 8px;
          font-family: var(--tp-ff-jost);
        }

        .faq-panel .badge {
          background: var(--tp-theme-secondary);
        }

        .panel-title {
          font-family: var(--tp-ff-jost);
          font-size: 24px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin: 0;
        }

        .rich-content, .simple-content {
          font-family: var(--tp-ff-roboto);
          font-size: 15px;
          line-height: 1.6;
          color: var(--tp-text-2);
          margin: 0;
        }

        .specs-divider {
          height: 1px;
          background: var(--tp-grey-2);
          margin: 24px 0 20px 0;
        }

        .specs-header-inline .badge {
          background: var(--tp-theme-secondary);
          margin-bottom: 8px;
        }

        .specs-title {
          font-family: var(--tp-ff-jost);
          font-size: 20px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin: 0 0 16px 0;
        }

        .specs-table {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--tp-grey-2);
          width: 100%;
          table-layout: auto;
        }

        .spec-row-compact {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--tp-grey-2);
          transition: background-color 0.2s ease;
        }

        .spec-row-compact:last-child {
          border-bottom: none;
        }

        .spec-row-compact:hover {
          background: var(--tp-common-white);
        }

        .spec-label-compact {
          font-family: var(--tp-ff-jost);
          font-size: 14px;
          font-weight: 600;
          color: var(--tp-text-1);
          min-width: 120px;
          flex-shrink: 0;
        }

        .spec-value-compact {
          font-family: var(--tp-ff-roboto);
          font-size: 14px;
          color: var(--tp-text-2);
          flex: 1;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 24px 0;
          }

          .description-panel, .faq-panel {
            padding: 20px;
            margin-bottom: 16px;
          }

          .panel-title {
            font-size: 20px;
          }

          .spec-row-compact {
            flex-direction: column;
            align-items: flex-start;
            padding: 10px 12px;
          }

          .spec-label-compact {
            min-width: auto;
            margin-bottom: 4px;
            font-size: 13px;
          }

          .spec-value-compact {
            font-size: 13px;
          }

          .specs-title {
            font-size: 18px;
          }
        }

        @media (max-width: 480px) {
          .description-panel, .faq-panel {
            padding: 16px;
          }

          .rich-content, .simple-content {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
