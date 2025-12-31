'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRightLong, ArrowRightLongPrev } from '@/svg';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_PATH || '/blogs';

const html = (s) => ({ __html: s || '' });

const PostboxDetailsNav = ({ currentId }) => {
  const [blogs, setBlogs] = useState([]);
  const [err, setErr] = useState('');

  // fetch all blogs once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}${BLOG_PATH}`, { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        setBlogs(Array.isArray(json?.data) ? json.data : []);
      } catch (e) {
        setErr(e?.message || 'Failed to load blogs');
      }
    })();
    return () => { alive = false; };
  }, []);

  // compute previous and next blog based on creation date
  const { prev, next } = useMemo(() => {
    if (!Array.isArray(blogs) || blogs.length === 0) return { prev: null, next: null };

    const sorted = [...blogs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const idx = sorted.findIndex((b) => b._id === currentId);
    if (idx === -1) return { prev: null, next: null };

    const prev = idx > 0 ? sorted[idx - 1] : null;
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    return { prev, next };
  }, [blogs, currentId]);

  if (err) return null;

  return (
    <div className="tp-postbox-details-navigation d-none d-md-flex justify-content-between align-items-center">

      {/* ---------- Previous Post ---------- */}
      <div className="tp-postbox-details-navigation-item d-flex align-items-center">
        {prev && (
          <>
            <div className="tp-postbox-details-navigation-icon mr-15">
              <span>
                <Link href={`/blog-details/${prev._id}`}>
                  <ArrowRightLongPrev />
                </Link>
              </span>
            </div>
            <div className="tp-postbox-details-navigation-content">
              <span>Previous Post</span>
              <h3
                className="tp-postbox-details-navigation-title"
                style={{ lineHeight: 1.4 }}
              >
                <Link
                  href={`/blog-details/${prev._id}`}
                  dangerouslySetInnerHTML={{
                    __html:
                      prev.title?.length > 80
                        ? prev.title.slice(0, 80) + '…'
                        : prev.title || '',
                  }}
                />
              </h3>
            </div>
          </>
        )}
      </div>

      {/* ---------- Next Post ---------- */}
      <div className="tp-postbox-details-navigation-item d-flex align-items-center text-end">
        {next && (
          <>
            <div className="tp-postbox-details-navigation-content">
              <span>Next Post</span>
              <h3
                className="tp-postbox-details-navigation-title"
                style={{ lineHeight: 1.4 }}
              >
                <Link
                  href={`/blog-details/${next._id}`}
                  dangerouslySetInnerHTML={{
                    __html:
                      next.title?.length > 80
                        ? next.title.slice(0, 80) + '…'
                        : next.title || '',
                  }}
                />
              </h3>
            </div>
            <div className="tp-postbox-details-navigation-icon ml-15">
              <span>
                <Link href={`/blog-details/${next._id}`}>
                  <ArrowRightLong />
                </Link>
              </span>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default PostboxDetailsNav;
