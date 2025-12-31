'use client';
import React from 'react';
import { Comment, Date as DateIcon, UserTwo } from '@/svg';

// Utility: detect if a string likely contains HTML tags
const looksLikeHtml = (s) => typeof s === 'string' && /<\/?[a-z][\s\S]*>/i.test(s);

const PostboxDetailsTop = ({ blog, renderHtmlTitle = false }) => {
  const { category, title = '', date , author } = blog || {};

  const shouldRenderHtml = renderHtmlTitle || looksLikeHtml(title);

  return (
    <div className="tp-postbox-details-top">
      {/* Category */}
      {category && (
        <div className="tp-postbox-details-category">
          <span>
            <a href="#" className="text-capitalize">{category}</a>
          </span>
        </div>
      )}

      {/* Title: render raw HTML if needed */}
      {shouldRenderHtml ? (
        // Use a block container so backend can send any markup (e.g., <h1>, <br>, <em>…)
        <div
          className="tp-postbox-details-title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      ) : (
        <h3 className="tp-postbox-details-title">{title}</h3>
      )}

      {/* Meta */}
      <div className="tp-postbox-details-meta mb-50">
        <span data-meta="author">
          <UserTwo />
          {' '}
          By <a href="#">{author || '—'}</a>
        </span>
        <span>
          <DateIcon />
          {' '}
          {date || ''}
        </span>
        <span>
          {' '}
        </span>
      </div>
    </div>
  );
};

export default PostboxDetailsTop;
