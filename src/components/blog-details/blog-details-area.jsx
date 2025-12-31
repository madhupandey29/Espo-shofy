'use client';
import React from 'react';
import Image from 'next/image';
import BlogSidebar from '../blog/blog-postox/blog-sidebar';
import PostboxDetailsTop from './postbox-details-top';
import shape_line from '@assets/img/blog/details/shape/line.png';
import shape_line_2 from '@assets/img/blog/details/shape/quote.png';

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

// convenience: render raw HTML or empty
const html = (s) => ({ __html: s || '' });

const BlogDetailsArea = ({ blog }) => {
  const hero =
    blog?.blogimage1 || blog?.blogimage2 || '/images/placeholder-16x9.jpg';
  const inlineImg =
    blog?.blogimage2 && blog.blogimage2 !== hero ? blog.blogimage2 : null;

  return (
    <section className="tp-postbox-details-area pb-120 pt-95">
      <div
        className="container"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 30px' }}
      >
        {/* ---------- Title + Meta ---------- */}
        <div className="row">
          <div className="col-xl-9">
            <PostboxDetailsTop
              blog={{
                // we pass title exactly as received (with tags) and render it as HTML in PostboxDetailsTop
                title: blog?.title || '',
                author: blog?.author || '—',
                date: fmt(blog?.createdAt),
              }}
              renderHtmlTitle
            />
          </div>

          {/* ---------- HERO IMAGE ---------- */}
          <div className="col-xl-12">
            <div
              className="tp-postbox-details-thumb"
              style={{
                width: '100%',
                height: 480,              // consistent hero frame
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 40,
                background: '#f3f5f8',    // subtle backdrop behind contain
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={hero}
                alt={blog?.title || 'blog image'}
                width={1600}
                height={900}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',    // show full photo
                  display: 'block',
                }}
                priority
              />
            </div>
          </div>
        </div>

        {/* ---------- Body + Sidebar ---------- */}
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="tp-postbox-details-main-wrapper">
              <div className="tp-postbox-details-content">

                {/* If your backend sends these with tags, render them raw */}
                {blog?.heading && (
                  <h4
                    className="tp-postbox-details-heading"
                    dangerouslySetInnerHTML={html(blog.heading)}
                  />
                )}

                {blog?.paragraph1 && (
                  <p
                    className="tp-dropcap"
                    dangerouslySetInnerHTML={html(blog.paragraph1)}
                  />
                )}

                {blog?.paragraph2 && (
                  <p dangerouslySetInnerHTML={html(blog.paragraph2)} />
                )}

                {/* ---------- INLINE IMAGE ---------- */}
                {inlineImg && (
                  <div
                    className="tp-postbox-details-desc-thumb text-center"
                    style={{
                      maxWidth: 900,
                      height: 380,            // consistent inline frame
                      margin: '30px auto 14px',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#f3f5f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      src={inlineImg}
                      alt="details image"
                      width={1200}
                      height={800}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain', // show full photo
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                {/* optional caption */}
                {inlineImg && (
                  <span
                    className="tp-postbox-details-desc-thumb-caption"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      fontSize: 14,
                      marginBottom: 26,
                      color: '#666',
                    }}
                    dangerouslySetInnerHTML={html(blog?.title || '')}
                  />
                )}

                {blog?.paragraph3 && (
                  <p dangerouslySetInnerHTML={html(blog.paragraph3)} />
                )}

                {/* ---------- Quote Block ---------- */}
                <div className="tp-postbox-details-quote">
                  <blockquote>
                    <div className="tp-postbox-details-quote-shape">
                      <Image
                        className="tp-postbox-details-quote-shape-1"
                        src={shape_line}
                        alt="shape"
                      />
                      <Image
                        className="tp-postbox-details-quote-shape-2"
                        src={shape_line_2}
                        alt="shape"
                      />
                    </div>
                    <p>
                      There is a way out of every box, a solution to every
                      puzzle — it’s just a matter of finding it.
                    </p>
                    <cite>{blog?.author || '—'}</cite>
                  </blockquote>
                </div>

                {/* ---------- Prev / Next + Author ---------- */}
              </div>
            </div>
          </div>

          {/* ---------- Sidebar ---------- */}
          <div className="col-xl-3 col-lg-4">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetailsArea;
