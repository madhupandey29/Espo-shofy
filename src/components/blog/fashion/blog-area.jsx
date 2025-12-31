'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TextShapeLine } from '@/svg';
import BlogItem from './blog-item';

// ---- API config (env-first, fallback to localhost) ----
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_PATH || '/blogs';

export default function BlogArea() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetch(`${API_BASE}${BLOG_PATH}`, { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        const list = Array.isArray(json?.data) ? json.data : [];
        setRows(list);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || 'Failed to load blogs');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // show the most recent 3
  const blogs = useMemo(
    () =>
      [...rows]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
    [rows]
  );

  return (
    <section className="tp-blog-area tp-blog-area--compact pt-60 pb-60" aria-labelledby="blog-heading">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-30 text-center tp-blog-head">
              <span className="tp-section-title-pre-2">
                Our Blog &amp; News
                <TextShapeLine />
              </span>
              <h3 id="blog-heading" className="tp-section-title-2">
                Latest News &amp; Articles
              </h3>
            </div>
          </div>
        </div>

        <div className="row tp-blog-grid">
          {loading && (
            <div className="col-12 text-center">
              <p className="tp-blog-state">Loading…</p>
            </div>
          )}

          {!loading && err && (
            <div className="col-12 text-center">
              <p className="tp-blog-state tp-blog-state--err">{err}</p>
            </div>
          )}

          {!loading && !err && blogs.length === 0 && (
            <div className="col-12 text-center">
              <p className="tp-blog-state">No posts yet.</p>
            </div>
          )}

          {!loading &&
            !err &&
            blogs.map((blog) => (
              <div key={blog._id} className="col-xl-4 col-lg-4 col-md-6 tp-blog-col">
                <BlogItem blog={blog} />
              </div>
            ))}
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-blog-more-2 mt-10 text-center tp-blog-cta">
              <Link href="/blog-grid" className="tp-btn tp-btn-blog-discover">
                Discover More
                <svg className="tp-btn-blog-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* =========================
           BLOG AREA - COMPACT MOBILE
           (logic unchanged, only spacing + responsive sizing)
           ========================= */

        .tp-blog-area--compact {
          position: relative;
        }

        .tp-blog-head {
          margin-bottom: 50px;
        }

        /* tighter row spacing */
        .tp-blog-grid {
          row-gap: 24px;
        }

        .tp-blog-state {
          margin: 0;
          font-family: var(--tp-ff-roboto);
          color: var(--tp-text-2);
          font-size: 14px;
          line-height: 1.6;
        }
        .tp-blog-state--err {
          color: #dc2626;
          font-weight: 600;
        }

        /* CTA button */
        .tp-btn.tp-btn-blog-discover {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 40px;
          background: var(--tp-theme-secondary);
          color: var(--tp-theme-primary);
          border: 2px solid var(--tp-theme-secondary);
          border-radius: 30px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s ease;
          font-family: var(--tp-ff-roboto);
          white-space: nowrap;
        }

        .tp-btn.tp-btn-blog-discover:hover {
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          border-color: var(--tp-theme-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(44, 76, 151, 0.25);
        }

        .tp-btn.tp-btn-blog-discover:hover .tp-btn-blog-arrow {
          transform: translateX(4px);
        }

        .tp-btn-blog-arrow {
          transition: transform 0.3s ease;
        }

        /* =========================
           ✅ Make BlogItem cards compact on mobile
           (overrides common theme classnames, no logic changes)
           ========================= */

        /* reduce oversized image blocks on mobile */
        @media (max-width: 768px) {
          /* section padding smaller */
          .tp-blog-area.pt-110 {
            padding-top: 52px !important;
          }
          .tp-blog-area.pb-120 {
            padding-bottom: 58px !important;
          }

          /* header typography smaller */
          .tp-blog-area .tp-section-title-pre-2 {
            font-size: 12px !important;
            letter-spacing: 1.1px !important;
            margin-bottom: 10px !important;
          }
          .tp-blog-area .tp-section-title-2 {
            font-size: 24px !important;
            line-height: 1.18 !important;
            margin-bottom: 0 !important;
          }
          .tp-blog-head {
            margin-bottom: 18px !important;
          }

          /* tighter grid */
          .tp-blog-grid {
            row-gap: 14px !important;
          }

          /* --- BlogItem common containers --- */
          .tp-blog-area .tp-blog-item,
          .tp-blog-area .tp-blog-item-2,
          .tp-blog-area .tp-blog-item-3 {
            border-radius: 14px !important;
          }

          /* image wrapper heights (covers most themes) */
          .tp-blog-area .tp-blog-thumb,
          .tp-blog-area .tp-blog-thumb-2,
          .tp-blog-area .tp-blog-thumb-3,
          .tp-blog-area .tp-blog-item-thumb,
          .tp-blog-area .tp-blog-img,
          .tp-blog-area .tp-blog-item__thumb {
            border-radius: 14px !important;
            overflow: hidden !important;
          }

          /* if wrapper is a fixed height block, cap it */
          .tp-blog-area .tp-blog-thumb,
          .tp-blog-area .tp-blog-thumb-2,
          .tp-blog-area .tp-blog-thumb-3,
          .tp-blog-area .tp-blog-item-thumb,
          .tp-blog-area .tp-blog-item__thumb {
            height: 220px !important;
          }

          /* make images cover nicely */
          .tp-blog-area .tp-blog-thumb img,
          .tp-blog-area .tp-blog-thumb-2 img,
          .tp-blog-area .tp-blog-thumb-3 img,
          .tp-blog-area .tp-blog-item-thumb img,
          .tp-blog-area .tp-blog-img img,
          .tp-blog-area .tp-blog-item__thumb img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
          }

          /* compact content padding */
          .tp-blog-area .tp-blog-content,
          .tp-blog-area .tp-blog-content-2,
          .tp-blog-area .tp-blog-content-3,
          .tp-blog-area .tp-blog-item__content {
            padding: 14px 14px 16px !important;
          }

          /* compact title */
          .tp-blog-area .tp-blog-title,
          .tp-blog-area .tp-blog-title-2,
          .tp-blog-area .tp-blog-title-3,
          .tp-blog-area .tp-blog-item__title {
            font-size: 18px !important;
            line-height: 1.25 !important;
            margin: 0 0 10px 0 !important;
          }

          /* compact meta/date chips if they exist */
          .tp-blog-area .tp-blog-meta,
          .tp-blog-area .tp-blog-meta-2,
          .tp-blog-area .tp-blog-item__meta,
          .tp-blog-area .tp-blog-date,
          .tp-blog-area .tp-blog-item__date {
            font-size: 12px !important;
            line-height: 1.2 !important;
          }

          /* CTA smaller */
          .tp-btn.tp-btn-blog-discover {
            padding: 12px 26px;
            font-size: 14px;
            gap: 10px;
          }

          .tp-blog-cta {
            margin-top: 6px !important;
          }
        }

        @media (max-width: 576px) {
          /* even tighter */
          .tp-blog-area.pt-110 {
            padding-top: 46px !important;
          }
          .tp-blog-area.pb-120 {
            padding-bottom: 52px !important;
          }

          .tp-blog-area .tp-section-title-2 {
            font-size: 22px !important;
          }

          /* slightly smaller image */
          .tp-blog-area .tp-blog-thumb,
          .tp-blog-area .tp-blog-thumb-2,
          .tp-blog-area .tp-blog-thumb-3,
          .tp-blog-area .tp-blog-item-thumb,
          .tp-blog-area .tp-blog-item__thumb {
            height: 200px !important;
          }

          /* full-width CTA */
          .tp-btn.tp-btn-blog-discover {
            width: 100%;
            justify-content: center;
            padding: 12px 18px;
            font-size: 14px;
            border-radius: 28px;
          }

          .tp-blog-state {
            font-size: 13.5px;
          }
        }

        @media (max-width: 380px) {
          .tp-blog-area .tp-section-title-2 {
            font-size: 21px !important;
          }
          .tp-blog-area .tp-blog-thumb,
          .tp-blog-area .tp-blog-thumb-2,
          .tp-blog-area .tp-blog-thumb-3,
          .tp-blog-area .tp-blog-item-thumb,
          .tp-blog-area .tp-blog-item__thumb {
            height: 185px !important;
          }
        }
      `}</style>
    </section>
  );
}
