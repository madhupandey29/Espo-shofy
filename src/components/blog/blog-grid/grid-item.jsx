'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightLong, Comment, Date as DateIcon } from '@/svg';

// safe date
const fmt = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  } catch {
    return '';
  }
};

const stripHtml = (v = '') =>
  String(v || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const normalizeImg = (v) => {
  if (!v) return { src: '' };
  if (typeof v === 'string') return { src: v };
  if (typeof v === 'object') {
    return {
      src: v.url || v.secure_url || v.src || v.path || '',
      width: v.width,
      height: v.height,
      alt: v.alt,
      title: v.title,
    };
  }
  return { src: '' };
};

const GridItem = ({ blog, style_2 = false, index = 0 }) => {
  const id = blog?._id;

  const img1 = normalizeImg(blog?.blogimage1);
  const img2 = normalizeImg(blog?.blogimage2);
  const chosen = img1.src ? img1 : img2.src ? img2 : null;

  const fallbackSrc = '/images/placeholder-16x9.jpg';
  const src = chosen?.src || fallbackSrc;

  // Use real width/height if backend provides, otherwise use a stable 16:9 default
  const width = Number(chosen?.width) > 0 ? Number(chosen.width) : 800;
  const height = Number(chosen?.height) > 0 ? Number(chosen.height) : 450;

  const rawTitle = blog?.title || '';
  const plainTitle = stripHtml(rawTitle) || 'Blog';
  const date = fmt(blog?.createdAt);

  const desc = blog?.heading || blog?.paragraph1 || blog?.paragraph2 || blog?.paragraph3 || '';

  // First 2 cards are usually above the fold in a 2-column grid
  const isAboveFold = index < 2;

  return (
    <article className={`tp-blog-grid-item ${style_2 ? 'tp-blog-grid-style2' : ''} p-relative mb-30 blog-card`}>
      <div className="blog-card__thumb mb-30">
        <Link href={`/blog-details/${id}`} className="block">
          <Image
            src={src}
            alt={plainTitle}
            title={plainTitle}
            width={width}
            height={height}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="blog-card__img w-100 h-auto"
            priority={isAboveFold}
            loading={isAboveFold ? 'eager' : 'lazy'}
          />
        </Link>
      </div>

      <div className="tp-blog-grid-content">
        <div className="tp-blog-grid-meta">
          <span><DateIcon /> {date}</span>
          <span><Comment /> Comments (0)</span>
        </div>

        <h3 className="tp-blog-grid-title">
          <Link href={`/blog-details/${id}`}>
            <span dangerouslySetInnerHTML={{ __html: rawTitle }} />
          </Link>
        </h3>

        <div className="tp-blog-grid-excerpt" dangerouslySetInnerHTML={{ __html: desc }} />

        <div className="tp-blog-grid-btn">
          <Link href={`/blog-details/${id}`} className="tp-link-btn-3">
            Read More <ArrowRightLong />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default GridItem;
