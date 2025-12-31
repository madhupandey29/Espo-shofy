// components/products/fashion/product-card-mini.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FALLBACK_IMG =
  'https://res.cloudinary.com/demo/image/upload/v1690000000/placeholder-square.webp';

const ProductCardMini = ({ product }) => {
  const href = product?.slug ? `/fabric/${product.slug}` : '#';
  const imgSrc =
    product?.img ||
    product?.image ||
    product?.image1 ||
    product?.imageURLs?.[0]?.url ||
    FALLBACK_IMG;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="mini-card">
      <div className="thumb">
        <Image
          src={imgSrc}
          alt={product?.name || 'Product'}
          fill
          sizes="200px"
        />
        <div className="overlay" />
      </div>
      <div className="info">
        <h4 className="name">{product?.name || 'Untitled Product'}</h4>
      </div>

      <style jsx>{`
        .mini-card {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          border: 2px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mini-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #d1d5db;
        }
        .thumb {
          position: relative;
          width: 100%;
          padding-top: 100%; /* square */
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          overflow: hidden;
        }
        .thumb :global(img) {
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .mini-card:hover .thumb :global(img) {
          transform: scale(1.05);
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.02) 60%,
            rgba(0,0,0,0.06) 100%
          );
          transition: opacity 0.3s ease;
        }
        .mini-card:hover .overlay {
          opacity: 0.7;
        }
        .info {
          padding: 12px 14px;
          background: linear-gradient(to bottom, #fff 0%, #fafafa 100%);
        }
        .name {
          font-family: 'Inter', 'Segoe UI', system-ui, Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.3;
          margin: 0;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s ease;
        }
        .mini-card:hover .name {
          color: #800000;
        }
      `}</style>
    </Link>
  );
};

export default ProductCardMini;
