'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightLong, Comment, Date as DateIcon } from '@/svg';

const fmt = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

const ListItem = ({ blog, index = 0 }) => {
  const id = blog?._id;

  const img1 = normalizeImg(blog?.blogimage1);
  const img2 = normalizeImg(blog?.blogimage2);
  const chosen = img1.src ? img1 : img2.src ? img2 : null;

  const fallbackSrc = '/images/placeholder-4x3.jpg';
  const src = chosen?.src || fallbackSrc;

  const rawTitle = blog?.title || 'Untitled';
  const plainTitle = stripHtml(rawTitle) || 'Blog';

  const date = fmt(blog?.createdAt);
  const comments = 0;

  // Prefer backend dims if provided; otherwise stable 4:3 default
  const width = Number(chosen?.width) > 0 ? Number(chosen.width) : 600;
  const height = Number(chosen?.height) > 0 ? Number(chosen.height) : 450;

  const desc =
    blog?.heading ||
    blog?.paragraph1 ||
    blog?.paragraph2 ||
    blog?.paragraph3 ||
    '';

  // First list item is usually above the fold
  const isAboveFold = index < 1;

  return (
    <div className="tp-blog-list-item d-md-flex d-lg-block d-xl-flex">
      <div className="tp-blog-list-thumb">
        <Link href={`/blog-details/${id}`}>
          <Image
            src={src}
            alt={plainTitle}
            title={plainTitle}
            width={width}
            height={height}
            className="object-cover w-100 h-auto"
            priority={isAboveFold}
            loading={isAboveFold ? 'eager' : 'lazy'}
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </Link>
      </div>

      <div className="tp-blog-list-content">
        <div className="tp-blog-grid-content">
          <div className="tp-blog-grid-meta">
            <span><DateIcon /> {date}</span>
            <span><Comment /> Comments ({comments})</span>
          </div>
          <h3 className="tp-blog-grid-title">
            <Link href={`/blog-details/${id}`}>
              <span dangerouslySetInnerHTML={{ __html: rawTitle }} />
            </Link>
          </h3>

          <p>{stripHtml(desc)}</p>

          <div className="tp-blog-grid-btn">
            <Link href={`/blog-details/${id}`} className="tp-link-btn-3">
              Read More <ArrowRightLong />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
