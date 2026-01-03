'use client';
import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

// Import Swiper styles locally
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

import { useGetTopRatedQuery } from '@/redux/features/newProductApi';
import ErrorMsg from '@/components/common/error-msg';
import { HomeTwoFeaturedPrdLoader } from '@/components/loader';

/* ---------------- image helpers ---------------- */
const isAbsUrl = (s) => /^(https?:)?\/\//i.test(s || '');
const pickUrlDeep = function pick(v) {
  if (!v) return '';
  if (typeof v === 'string') {
    const s = v.trim().replace(/\s+/g, '');
    return s.startsWith('//') ? `https:${s}` : s;
  }
  if (Array.isArray(v)) for (const x of v) { const got = pickUrlDeep(x); if (got) return got; }
  if (typeof v === 'object')
    for (const val of Object.values(v || {})) {
      const got = pickUrlDeep(val);
      if (got) return got;
    }
  return '';
};

function absoluteUrlFromAnything(src) {
  const raw = pickUrlDeep(src);
  if (!raw) return '';
  if (isAbsUrl(raw)) return raw;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const clean = String(raw).replace(/^\/+/, '').replace(/^api\/+/, '');
  return base ? `${base}/${clean}` : `/${clean}`;
}

function getImageUrl(item) {
  const p = item?.product || item;
  
  // First check for Cloudinary URLs (direct URLs)
  const cloudinaryFields = [
    p?.image1CloudUrl, p?.image2CloudUrl, p?.image3CloudUrl,
    p?.imageCloudUrl, p?.cloudUrl
  ];

  for (const field of cloudinaryFields) {
    if (field && typeof field === 'string' && field.trim() && 
        field !== 'null' && field !== 'undefined' && field !== '') {
      const cleanUrl = field.trim();
      if (cleanUrl.startsWith('http')) {
        return cleanUrl;
      }
    }
  }
  
  // Try different image fields
  const imageFields = [
    p?.image1, p?.image2, p?.image3, p?.img, p?.image, 
    p?.images, p?.thumbnail, p?.cover, p?.photo, p?.picture, p?.media
  ];

  for (const field of imageFields) {
    const url = absoluteUrlFromAnything(field);
    if (url && url !== '') {
      return url;
    }
  }

  return '/assets/img/product/product-1.jpg';
}

/* ---------------- productTag -> top badge (replace Denim Fabrics) ---------------- */
const normalizeTag = (t) =>
  String(t || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const getTagArray = (p, item) => {
  const tags = p?.productTag ?? item?.productTag ?? [];
  return Array.isArray(tags) ? tags : [];
};

const pickTopLabelFromTags = (tags = []) => {
  const set = new Set(tags.map(normalizeTag));

  // Priority you asked: if endpoint is Top Rated, show that first when present
  if (set.has('top-rated') || set.has('toprated') || set.has('topratedproduct')) return 'Top Rated';
  if (set.has('popular')) return 'Popular';
  if (set.has('new') || set.has('new-arrival') || set.has('newarrival')) return 'New Arrival';

  // fallback: show first tag as label
  const first = tags.find(Boolean);
  return first ? String(first).replace(/[-_]/g, ' ') : 'Featured';
};

/* ---------------- slider settings ---------------- */
const SLIDER_SETTINGS = {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: false,
  autoplay: false,
  centeredSlides: false,
  pagination: {
    el: '.featured-pagination',
    clickable: true,
    dynamicBullets: true,
  },
  navigation: {
    nextEl: '.featured-next',
    prevEl: '.featured-prev',
  },
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  allowTouchMove: true,
  touchStartPreventDefault: false,
  touchMoveStopPropagation: false,
  resistanceRatio: 0.85,
  threshold: 5,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  grabCursor: true,
  touchEventsTarget: 'container',
  passiveListeners: false,
  watchSlidesProgress: true,
  watchSlidesVisibility: true,
  breakpoints: {
    1400: {
      slidesPerView: 4,
      spaceBetween: 30,
      centeredSlides: false,
      loop: true,
      loopAdditionalSlides: 2,
    },
    1200: {
      slidesPerView: 3,
      spaceBetween: 25,
      centeredSlides: false,
      loop: true,
      loopAdditionalSlides: 2,
    },
    992: {
      slidesPerView: 3,
      spaceBetween: 20,
      centeredSlides: false,
      loop: false,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 15,
      centeredSlides: false,
      loop: false,
    },
    576: {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: false,
    },
    0: {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: false,
    },
  },
  keyboard: { enabled: true, onlyInViewport: true },
};

const CARD_W = 320;
const CARD_H = 320;

/* ---------------- component ---------------- */
const WeeksFeatured = () => {
  const { data: products, isError, isLoading } = useGetTopRatedQuery();
  const swiperRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.update();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let content = null;
  if (isLoading) content = <HomeTwoFeaturedPrdLoader loading />;
  else if (isError) content = <ErrorMsg msg="There was an error" />;
  else if (!products?.data?.length) content = <ErrorMsg msg="No Products found!" />;
  else {
    const items = products.data;

    content = (
      <Swiper
        {...SLIDER_SETTINGS}
        ref={swiperRef}
        modules={[Pagination, Autoplay, Navigation]}
        className="featured-slider"
        onSwiper={(swiper) => {
          swiperRef.current = { swiper };
        }}
      >
        {items.map((item, idx) => {
          const p = item?.product || item;
          const pid = p?._id || idx;
          const title = p?.name || item?.title || 'Product Name';
          const imageUrl = getImageUrl(item);
          
          // Debug logging for weeks-featured
          console.log(`Featured Product ${idx}:`, { 
            pid, 
            title, 
            image1CloudUrl: p?.image1CloudUrl,
            image2CloudUrl: p?.image2CloudUrl,
            image3CloudUrl: p?.image3CloudUrl,
            finalImageUrl: imageUrl,
            slug 
          });
          
          const slug = p?.slug || pid;
          const detailsHref = `/fabric/${encodeURIComponent(slug)}`;

          // ✅ Top-left badge text comes from productTag[]
          const tagArr = getTagArray(p, item);
          const topLabel = pickTopLabelFromTags(tagArr);

          // leadtime
          const leadtimeData = p?.leadtime;
          const leadtimeText = Array.isArray(leadtimeData) && leadtimeData.length > 0 ? leadtimeData[0] : 'In Stock';

          const eager = idx < 3;

          return (
            <SwiperSlide key={pid} className="featured-slide">
              <div className="featured-card">
                {/* Card Top Section */}
                <div className="card-top">
                  {/* ✅ productTag label (replaces Denim Fabrics) */}
                  <div className="category-tag">
                    <span className="tag-text">{topLabel}</span>
                  </div>

                  {/* Image Container */}
                  <Link href={detailsHref} target="_blank" rel="noopener noreferrer" className="card-image-container">
                    <div className="image-wrapper">
                      <Image
                        src={imageUrl}
                        alt={title}
                        width={CARD_W}
                        height={CARD_H}
                        sizes="(max-width: 768px) 100vw, 320px"
                        priority={eager}
                        loading={eager ? 'eager' : 'lazy'}
                        quality={90}
                        className="card-image"
                        onError={(e) => {
                          e.target.src = '/assets/img/product/product-1.jpg';
                        }}
                      />
                    </div>

                    {/* ❌ Removed New Arrival badge */}
                  </Link>
                </div>

                {/* Card Bottom Section */}
                <div className="card-bottom">
                  <div className="product-info">
                    <h3 className="product-title">
                      <Link href={detailsHref} target="_blank" rel="noopener noreferrer">
                        {title}
                      </Link>
                    </h3>

                    <div className="quick-stats">
                      <div className="stat-item">
                        <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="stat-text">Premium Quality</span>
                      </div>

                      <div className="stat-item">
                        <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="stat-text">{leadtimeText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="quick-action">
                    <Link href={detailsHref} target="_blank" rel="noopener noreferrer" className="quick-view-btn">
                      <span className="btn-text">Explore</span>
                      <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M14 5L21 12M21 12L14 19M21 12H3"
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
            </SwiperSlide>
          );
        })}
      </Swiper>
    );
  }

  return (
    <section className="featured-section pt-10 pb-10">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 text-center mb-50">
              <span className="section-subtitle">
                Featured Collections
                <svg className="tp-shape-line" width="60" height="4" viewBox="0 0 60 4" fill="none">
                  <path d="M0 2H60" stroke="var(--tp-theme-secondary)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="section-title">Top-Rated Fabrics</h3>
            </div>
          </div>
        </div>

        <div className="featured-slider-wrapper">
          {/* Navigation Arrows */}
          <div className="featured-nav-wrapper">
            <button className="featured-nav featured-prev" type="button" aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <button className="featured-nav featured-next" type="button" aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>

          {content}
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="featured-btn-wrapper text-center mt-10">
              <Link href="/shop" className="view-all-link">
                Browse All
                <svg className="link-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
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
  /* ===== SECTION STYLES ===== */
  .featured-section {
    background: var(--tp-grey-1);
    position: relative;
  }

  /* ===== SECTION HEADER ===== */
  .tp-section-title-wrapper-2 {
    position: relative;
  }

  .section-subtitle {
    display: inline-block;
    color: var(--tp-theme-primary);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
    font-family: var(--tp-ff-jost);
    position: relative;
  }

  .tp-shape-line {
    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translateX(-50%);
  }

  .section-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--tp-text-1);
    margin-bottom: 16px;
    font-family: var(--tp-ff-jost);
    line-height: 1.2;
  }

  .view-all-link {
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

  .view-all-link:hover {
    background: var(--tp-common-white);
    color: var(--tp-theme-primary);
    border-color: var(--tp-theme-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(44, 76, 151, 0.25);
  }

  .view-all-link:hover .link-arrow {
    transform: translateX(4px);
  }

  .link-arrow {
    transition: transform 0.3s ease;
  }

  /* ===== SLIDER WRAPPER ===== */
  .featured-slider-wrapper {
    margin: 0;
    padding: 10px 50px 50px;
    position: relative;
  }

  .featured-slider {
    padding: 10px !important;
    overflow: hidden;
  }

  .featured-slide {
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* Navigation Arrows */
  .featured-nav-wrapper {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    z-index: 10;
    pointer-events: none;
  }

  /* ✅ Transparent / glass arrows */
  .featured-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;

    background: rgba(17, 35, 56, 0.28);
    border: 1px solid rgba(44, 76, 151, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    color: rgba(44, 76, 151, 0.95);
    cursor: pointer;
    transition: all 0.25s ease;
    pointer-events: auto;

    box-shadow: 0 6px 18px rgba(15, 34, 53, 0.1);
  }

  .featured-prev {
    left: 10px;
  }

  .featured-next {
    right: 10px;
  }

  .featured-nav:hover {
    background: rgba(17, 35, 56, 0.4);
    border-color: rgba(44, 76, 151, 0.45);
    color: rgba(44, 76, 151, 1);
    transform: translateY(-50%) scale(1.06);
  }

  .featured-nav:active {
    transform: translateY(-50%) scale(0.98);
  }

  /* ===== MODERN CARD DESIGN ===== */
  .featured-card {
    background: var(--tp-common-white);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(15, 34, 53, 0.08);
    border: 1px solid var(--tp-grey-2);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .featured-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(44, 76, 151, 0.12);
    border-color: var(--tp-theme-primary);
  }

  /* Card Top */
  .card-top {
    padding: 20px 20px 0;
    position: relative;
  }

  .category-tag {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 2;
  }

  /* ✅ Top-left tag style */
  .tag-text {
    display: inline-block;
    padding: 6px 12px;
    background: var(--tp-theme-primary);
    color: var(--tp-common-white);
    font-size: 11px;
    font-weight: 600;
    border-radius: 16px;
    font-family: var(--tp-ff-jost);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .card-image-container {
    display: block;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: var(--tp-grey-5);
    aspect-ratio: 1;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .card-image {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    padding: 25px;
    transition: transform 0.6s ease;
  }

  .featured-card:hover .card-image {
    transform: scale(1.05);
  }

  /* Card Bottom */
  .card-bottom {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--tp-common-white);
  }

  .product-info {
    margin-bottom: 20px;
    flex: 1;
  }

  .product-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--tp-text-1);
    line-height: 1.4;
    margin: 0 0 15px;
    font-family: var(--tp-ff-jost);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .product-title a {
    color: var(--tp-text-1) !important;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .product-title a:hover {
    color: var(--tp-theme-primary);
  }

  .quick-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-icon {
    color: var(--tp-theme-secondary);
    flex-shrink: 0;
  }

  .stat-text {
    font-size: 13px;
    color: var(--tp-text-2);
    font-weight: 500;
    font-family: var(--tp-ff-roboto);
  }

  /* Quick Action Button */
  .quick-action {
    border-top: 1px solid var(--tp-grey-2);
    padding-top: 18px;
  }

  .quick-view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: var(--tp-common-white);
    color: var(--tp-theme-primary);
    border: 2px solid var(--tp-theme-primary);
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    transition: all 0.3s ease;
    font-family: var(--tp-ff-jost);
  }

  .quick-view-btn:hover {
    background: var(--tp-theme-primary);
    color: var(--tp-common-white);
    border-color: var(--tp-theme-primary);
    transform: translateY(-2px);
  }

  .quick-view-btn:hover .btn-icon {
    transform: translateX(3px);
  }

  .btn-icon {
    transition: transform 0.3s ease;
  }

  /* Pagination hidden */
  .featured-pagination,
  .featured-pagination .swiper-pagination-bullet,
  .featured-pagination .swiper-pagination-bullet-active {
    display: none !important;
  }

  /* =========================
     MOBILE: COMPACT BEAUTIFUL
     ========================= */

  /* Tablets & below */
  @media (max-width: 992px) {
    .section-title {
      font-size: 30px;
    }
    .featured-slider-wrapper {
      padding: 12px 24px 40px;
    }
  }

  /* Mobile */
  @media (max-width: 768px) {
    /* make whole section tighter */
    .featured-section.pt-10 {
      padding-top: 18px !important;
    }
    .featured-section.pb-10 {
      padding-bottom: 18px !important;
    }

    /* header compact */
    .tp-section-title-wrapper-2.mb-50 {
      margin-bottom: 24px !important;
    }
    .section-subtitle {
      font-size: 12px;
      letter-spacing: 1.2px;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 24px;
      margin-bottom: 6px;
    }

    /* slider padding compact */
    .featured-slider-wrapper {
      padding: 8px 10px 26px;
      margin: 0;
    }
    .featured-slider {
      overflow: hidden !important;
      padding: 0 !important;
    }
    .featured-slide {
      width: 100% !important;
      padding: 0 10px !important;
    }

    /* card compact height */
    .featured-card {
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(15, 34, 53, 0.10) !important;
    }

    /* top padding reduced */
    .card-top {
      padding: 14px 14px 0;
    }

    /* badge smaller */
    .category-tag {
      top: 12px;
      left: 12px;
    }
    .tag-text {
      padding: 5px 10px;
      font-size: 10px;
      border-radius: 14px;
    }

    /* image area: less padding so image becomes bigger without increasing card */
    .card-image-container {
      border-radius: 12px;
    }
    .card-image {
      padding: 12px;
    }

    /* bottom spacing reduced */
    .card-bottom {
      padding: 14px;
    }
    .product-info {
      margin-bottom: 12px;
    }
    .product-title {
      font-size: 15px;
      margin: 0 0 10px;
      -webkit-line-clamp: 2;
    }

    .quick-stats {
      gap: 6px;
    }
    .stat-icon {
      width: 15px;
      height: 15px;
    }
    .stat-text {
      font-size: 12px;
    }

    .quick-action {
      padding-top: 12px;
    }

    /* button compact */
    .quick-view-btn {
      padding: 10px 12px;
      font-size: 13px;
      border-radius: 10px;
      min-height: 42px;
    }
    .btn-icon {
      width: 16px;
      height: 16px;
    }

    /* browse all button compact */
    .featured-btn-wrapper.mt-10 {
      margin-top: 14px !important;
    }
    .view-all-link {
      width: 100%;
      justify-content: center;
      padding: 12px 18px;
      font-size: 14px;
      border-radius: 28px;
      gap: 10px;
      min-height: 44px;
    }
    .link-arrow {
      width: 16px;
      height: 16px;
    }

    /* nav arrows keep, but slightly less intrusive */
    .featured-prev {
      left: 6px;
    }
    .featured-next {
      right: 6px;
    }
  }

  /* Small phones */
  @media (max-width: 576px) {
    .featured-nav {
      width: 34px;
      height: 34px;
      background: rgba(17, 35, 56, 0.2);
      border: 1px solid rgba(44, 76, 151, 0.18);
      box-shadow: 0 4px 14px rgba(15, 34, 53, 0.08);
    }
    .featured-nav svg {
      width: 14px;
      height: 14px;
    }
    .featured-prev {
      left: 6px;
    }
    .featured-next {
      right: 6px;
    }

    .section-title {
      font-size: 22px;
    }

    .featured-slide {
      padding: 0 8px !important;
    }

    .card-top {
      padding: 12px 12px 0;
    }
    .card-bottom {
      padding: 12px;
    }
    .product-title {
      font-size: 14px;
    }
    .stat-text {
      font-size: 11.5px;
    }
  }

  /* Very small devices */
  @media (max-width: 380px) {
    .section-title {
      font-size: 20px;
    }
    .quick-view-btn {
      font-size: 12.5px;
      min-height: 40px;
    }
    .view-all-link {
      font-size: 13px;
      min-height: 42px;
    }
  }
`}</style>

    </section>
  );
};

export default WeeksFeatured;
