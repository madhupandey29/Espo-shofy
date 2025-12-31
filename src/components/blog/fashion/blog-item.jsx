'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tags } from '@/svg';

// simple date formatter (supports API date)
const fmt = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export default function BlogItem({ blog }) {
  // Works with both your API objects and the old demo object
  const id   = blog?._id || blog?.id || '';
  const img  = blog?.blogimage1 || blog?.blogimage2 || blog?.img || '/images/placeholder-16x9.jpg';
  const date = fmt(blog?.createdAt) || blog?.date || '';
  const tags = Array.isArray(blog?.tags) ? blog.tags
             : Array.isArray(blog?.categories) ? blog.categories
             : [];

  const titleHtml = blog?.title || 'Untitled';

  return (
    <div className="tp-blog-item-2 mb-40">
      {/* THUMB - fixed height, crop nicely */}
      <div
        className="tp-blog-thumb-2 p-relative fix"
        style={{
          height: 300,          // <- make smaller; keep consistent
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Link href={`/blog-details/${id}`}>
          <Image
            src={img}
            alt="blog img"
            width={900}
            height={460}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover', // cover for cards (contain would letterbox)
              display: 'block',
            }}
            priority={false}
          />
        </Link>

        {date && (
          <div className="tp-blog-meta-date-2">
            <span>{date}</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="tp-blog-content-2 has-thumbnail">
        <div className="tp-blog-meta-2">
          {tags.slice(0, 3).map((t, i) => (
            <a key={`${String(t)}-${i}`} href="#">
              {String(t)}
              {i < Math.min(3, tags.length) - 1 && ', '}
            </a>
          ))}
        </div>

        <h3 className="tp-blog-title-2">
          <Link href={`/blog-details/${id}`}>
            {/* Render backend HTML inside the title */}
            <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
          </Link>
        </h3>
      </div>
    </div>
  );
}
