'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles locally
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

import { useGetPopularNewProductsQuery } from '@/redux/features/newProductApi';
import ErrorMsg from '@/components/common/error-msg';
import { HomeTwoPopularPrdLoader } from '@/components/loader';

/* ---------- helpers ---------- */
const isAbsUrl = (s) => /^(https?:)?\/\//i.test(s || '');
const cleanStringUrl = (s) => {
  if (!s) return '';
  const v = String(s).trim().replace(/\s+/g, '');
  if (!v || v === 'null' || v === 'undefined') return '';
  return v.startsWith('//') ? `https:${v}` : v;
};

const pickUrlDeep = function pick(v) {
  if (!v) return '';
  if (typeof v === 'string') return cleanStringUrl(v);

  if (Array.isArray(v)) {
    for (const x of v) {
      const got = pickUrlDeep(x);
      if (got) return got;
    }
    return '';
  }

  if (typeof v === 'object') {
    const direct =
      v.secure_url ||
      v.url ||
      v.path ||
      v.key ||
      v.src ||
      v.publicUrl ||
      v.imageUrl;

    const fromDirect = pickUrlDeep(direct);
    if (fromDirect) return fromDirect;

    for (const val of Object.values(v)) {
      const got = pickUrlDeep(val);
      if (got) return got;
    }
    return '';
  }

  return '';
};

function absoluteUrlFromAnything(src) {
  const raw = pickUrlDeep(src);
  if (!raw) return '';
  if (isAbsUrl(raw)) return raw;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const clean = String(raw)
    .replace(/^\/+/, '')
    .replace(/^api\/uploads\/?/, '')
    .replace(/^uploads\/?/, '');

  return base ? `${base}/uploads/${clean}` : `/${clean}`;
}

function getItemImage(item) {
  const p = item?.product || item;

  const imageFields = [
    p?.image1, p?.image2, p?.image3, p?.img, p?.image,
    p?.images, p?.thumbnail, p?.cover, p?.photo, p?.picture, p?.media
  ];

  for (const field of imageFields) {
    const url = absoluteUrlFromAnything(field);
    if (url && url !== '') return url;
  }

  return '/assets/img/product/product-1.jpg';
}

/* ---------- Badge from API productTag[] ---------- */
const normalizeTag = (t) =>
  String(t || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const pickBadgeFromTags = (tags = []) => {
  if (!Array.isArray(tags)) return null;
  const set = new Set(tags.map(normalizeTag));

  if (set.has('popular')) return { key: 'popular', label: 'Popular' };
  if (set.has('top-rated') || set.has('toprated') || set.has('topratedproduct'))
    return { key: 'top-rated', label: 'Top Rated' };
  if (set.has('new') || set.has('new-arrival') || set.has('newarrival'))
    return { key: 'new', label: 'New' };

  return null;
};

/* ---------- slider options ---------- */
const SLIDER_OPTS = {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: false,
  speed: 400,
  centeredSlides: false,
  autoplay: false,
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.tp-popular-next', prevEl: '.tp-popular-prev' },
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
    1400: { slidesPerView: 5, spaceBetween: 24, centeredSlides: false, loop: true, loopAdditionalSlides: 2 },
    1200: { slidesPerView: 4, spaceBetween: 20, centeredSlides: false, loop: true, loopAdditionalSlides: 2 },
    992:  { slidesPerView: 3, spaceBetween: 20, centeredSlides: false, loop: false },
    768:  { slidesPerView: 2, spaceBetween: 15, centeredSlides: false, loop: false },
    576:  { slidesPerView: 1, spaceBetween: 0,  centeredSlides: false, loop: false },
    0:    { slidesPerView: 1, spaceBetween: 0,  centeredSlides: false, loop: false },
  },
  keyboard: { enabled: true, onlyInViewport: true },
};

const CARD_W = 260;
const CARD_H = 300;

export default function PopularProducts() {
  const { data, isError, isLoading } = useGetPopularNewProductsQuery();
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

  let carousel = <ErrorMsg msg="No Products found!" />;
  if (isLoading) carousel = <HomeTwoPopularPrdLoader loading />;
  if (!isLoading && isError) carousel = <ErrorMsg msg="There was an error" />;

  if (
    !isLoading &&
    !isError &&
    (data?.status === 1 || data?.success === true) &&
    Array.isArray(data?.data) &&
    data.data.length
  ) {
    const items = data.data;

    carousel = (
      <Swiper
        {...SLIDER_OPTS}
        ref={swiperRef}
        modules={[Pagination, Autoplay, Navigation]}
        className="tp-popular-products-slider"
        onSwiper={(swiper) => {
          swiperRef.current = { swiper };
        }}
      >
        {items.map((seoDoc, idx) => {
          const p = seoDoc.product || seoDoc;
          const src = getItemImage(seoDoc);
          const pid = p?._id;
          const slug = p?.slug || pid;
          const pname = p?.name ?? 'Product';
          const detailsHref = slug ? `/fabric/${slug}` : '#';
          const eager = idx < 3;

          const tags = p?.productTag || seoDoc?.productTag || [];
          const badge = pickBadgeFromTags(tags);

          return (
            <SwiperSlide key={seoDoc._id || pid || idx} className="tp-popular-slide">
              <div className="tp-popular-product-card">
                {/* Product Image */}
                <div className="tp-popular-product-img-wrapper">
                  <Link href={detailsHref} className="tp-popular-product-img-link">
                    {badge && (
                      <div className="tp-popular-badge">
                        <span className={`tp-popular-badge-text tp-badge-${badge.key}`}>
                          {badge.label}
                        </span>
                      </div>
                    )}

                    <Image
                      src={src}
                      alt={pname}
                      width={CARD_W}
                      height={CARD_H}
                      sizes="(max-width: 768px) 100vw, 260px"
                      priority={eager}
                      loading={eager ? 'eager' : 'lazy'}
                      quality={80}
                      className="tp-popular-product-img"
                      onError={(e) => {
                        e.target.src = '/assets/img/product/product-1.jpg';
                      }}
                    />
                  </Link>
                </div>

                {/* Product Info */}
                <div className="tp-popular-product-info">
                  <h3 className="tp-popular-product-title">
                    <Link href={detailsHref}>{pname}</Link>
                  </h3>

                  <div className="tp-popular-product-action">
                    <Link href={detailsHref} className="tp-btn tp-btn-popular">
                      Explore Details
                      <svg className="tp-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            </SwiperSlide>
          );
        })}
      </Swiper>
    );
  }

  return (
    <section className="tp-popular-products-area pt-30 pb-30">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 text-center mb-50">
              <span className="tp-section-title-pre-2">
                Popular Collection
                <svg className="tp-shape-line" width="60" height="4" viewBox="0 0 60 4" fill="none">
                  <path d="M0 2H60" stroke="var(--tp-theme-secondary)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="tp-section-title-2">Our Most Popular Fabrics</h3>
              <p className="tp-section-description">Premium quality fabrics loved by designers and manufacturers</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-popular-products-slider-wrapper">
              {/* Navigation Arrows */}
              <div className="tp-popular-nav-wrapper">
                <button className="tp-popular-nav tp-popular-prev" type="button" aria-label="Previous">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>
                <button className="tp-popular-nav tp-popular-next" type="button" aria-label="Next">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </div>

              {carousel}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-popular-products-btn-wrapper text-center mt-20">
              <Link href="/shop" className="tp-btn tp-btn-border tp-btn-shop-all">
                View All Products
                <svg className="tp-btn-shop-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        /* Main Section Styling */
        .tp-popular-products-area {
          background: var(--tp-grey-1);
          position: relative;
        }

        .tp-popular-products-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--tp-grey-2), transparent);
        }

        /* Section Title */
        .tp-section-title-wrapper-2 {
          position: relative;
        }

        .tp-section-title-pre-2 {
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

        .tp-section-title-2 {
          font-size: 36px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 16px;
          font-family: var(--tp-ff-jost);
          line-height: 1.2;
        }

        .tp-section-description {
          color: var(--tp-text-2);
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto;
          font-family: var(--tp-ff-roboto);
          line-height: 1.6;
        }

        /* Slider Wrapper */
        .tp-popular-products-slider-wrapper {
          margin: 0;
          padding: 20px 50px 40px;
          position: relative;
        }

        .tp-popular-products-slider {
          padding: 10px !important;
          overflow: hidden;
        }

        /* Swiper Slide Styling */
        .tp-popular-slide {
          height: auto !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Navigation Arrows Wrapper */
        .tp-popular-nav-wrapper {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          z-index: 10;
          pointer-events: none;
        }

        /* Glass / transparent arrows */
        .tp-popular-nav {
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

        .tp-popular-prev { left: 10px; }
        .tp-popular-next { right: 10px; }

        .tp-popular-nav:hover {
          background: rgba(17, 35, 56, 0.4);
          border-color: rgba(44, 76, 151, 0.45);
          color: rgba(44, 76, 151, 1);
          transform: translateY(-50%) scale(1.06);
        }

        .tp-popular-nav:active { transform: translateY(-50%) scale(0.98); }

        .tp-popular-nav:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Product Card */
        .tp-popular-product-card {
          background: var(--tp-common-white);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(15, 34, 53, 0.05);
          border: 1px solid var(--tp-grey-2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .tp-popular-product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(44, 76, 151, 0.15);
          border-color: var(--tp-theme-primary);
        }

        /* Image Container */
        .tp-popular-product-img-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 10px 10px 0 0;
          background: var(--tp-grey-5);
          aspect-ratio: 1;
        }

        .tp-popular-product-img-link {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* Badge */
        .tp-popular-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
        }

        .tp-popular-badge-text {
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

        .tp-badge-popular { background: var(--tp-theme-primary); color: var(--tp-common-white); }
        .tp-badge-top-rated { background: var(--tp-theme-secondary); color: var(--tp-text-1); }
        .tp-badge-new { background: #16a34a; color: #fff; }

        .tp-popular-product-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          padding: 22px; /* desktop base */
          transition: transform 0.5s ease;
          background: var(--tp-grey-5);
        }

        .tp-popular-product-card:hover .tp-popular-product-img {
          transform: scale(1.05);
        }

        /* Product Info */
        .tp-popular-product-info {
          padding: 22px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--tp-common-white);
          border-radius: 0 0 10px 10px;
        }

        .tp-popular-product-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--tp-text-1);
          margin-bottom: 18px;
          line-height: 1.35;
          font-family: var(--tp-ff-jost);
          text-align: center;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tp-popular-product-title a {
          color: var(--tp-text-1) !important;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .tp-popular-product-title a:hover { color: var(--tp-theme-primary); }

        .tp-popular-product-action { margin-top: auto; }

        /* Button Styling */
        .tp-btn.tp-btn-popular {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          border: 2px solid var(--tp-theme-primary);
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
          font-family: var(--tp-ff-roboto);
          position: relative;
          overflow: hidden;
        }

        .tp-btn.tp-btn-popular:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          box-shadow: 0 4px 16px rgba(44, 76, 151, 0.2);
        }

        .tp-btn.tp-btn-popular:hover .tp-btn-arrow { transform: translateX(4px); }
        .tp-btn-arrow { transition: transform 0.3s ease; }

        /* Shop All Button */
        .tp-btn.tp-btn-border.tp-btn-shop-all {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 40px;
          background: var(--tp-theme-secondary);
          border: 2px solid var(--tp-theme-secondary);
          color: var(--tp-theme-primary);
          border-radius: 30px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s ease;
          font-family: var(--tp-ff-roboto);
        }

        .tp-btn.tp-btn-border.tp-btn-shop-all:hover {
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          border-color: var(--tp-theme-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(44, 76, 151, 0.25);
        }

        .tp-btn.tp-btn-border.tp-btn-shop-all:hover .tp-btn-shop-arrow { transform: translateX(4px); }
        .tp-btn-shop-arrow { transition: transform 0.3s ease; }

        /* Swiper Pagination - Hidden */
        .swiper-pagination,
        .swiper-pagination-bullet,
        .swiper-pagination-bullet-active {
          display: none !important;
        }

        /* ---------- Responsive Design (clean + compact) ---------- */

        @media (max-width: 1200px) {
          .tp-section-title-2 { font-size: 32px; }
          .tp-popular-product-title { font-size: 16px; }
        }

        @media (max-width: 992px) {
          .tp-section-title-2 { font-size: 28px; }
          .tp-section-description { font-size: 15px; }
          .tp-popular-product-info { padding: 18px; }
          .tp-btn.tp-btn-popular { padding: 14px; font-size: 13px; }
        }

        /* ✅ Main mobile compact */
        @media (max-width: 768px) {
          .tp-popular-products-area { padding: 26px 0; }

          .tp-section-title-wrapper-2 { margin-bottom: 22px !important; }
          .tp-section-title-pre-2 { font-size: 12px; letter-spacing: 1.2px; margin-bottom: 10px; }
          .tp-section-title-2 { font-size: 22px; margin-bottom: 10px; }
          .tp-section-description { font-size: 13px; line-height: 1.55; }

          .tp-popular-products-slider-wrapper {
            padding: 10px 0 16px;
          }

          .tp-popular-products-slider {
            overflow: hidden !important;
            padding: 6px 10px !important;
          }

          .tp-popular-products-slider .swiper-slide {
            display: flex !important;
            justify-content: center !important;
            padding: 0 8px !important;
          }

          /* compact card */
          .tp-popular-product-card {
            width: 100% !important;
            max-width: 360px !important;
            margin: 0 auto !important;
            box-shadow: 0 8px 20px rgba(15, 34, 53, 0.10);
          }

          .tp-popular-product-img-wrapper {
            aspect-ratio: 1/1;
            /* keeps image area not too tall */
            min-height: 230px;
          }

          .tp-popular-product-img {
            padding: 16px;
          }

          .tp-popular-product-info {
            padding: 14px 14px 16px;
          }

          .tp-popular-product-title {
            font-size: 15px;
            margin-bottom: 12px;
            min-height: 38px;
          }

          /* buttons compact */
          .tp-btn.tp-btn-popular {
            padding: 11px 12px;
            font-size: 13px;
            border-radius: 10px;
            gap: 8px;
          }

          .tp-btn.tp-btn-popular .tp-btn-arrow {
            width: 14px;
            height: 14px;
          }

          /* view all products compact */
          .tp-popular-products-btn-wrapper { margin-top: 14px !important; }
          .tp-btn.tp-btn-border.tp-btn-shop-all {
            width: 100%;
            justify-content: center;
            padding: 12px 18px;
            font-size: 13px;
            border-radius: 26px;
          }

          /* arrows visible */
          .tp-popular-nav-wrapper { display: block; }
          .tp-popular-nav { display: flex; }
        }

        /* ✅ Small phones: tighter still */
        @media (max-width: 576px) {
          .tp-popular-nav {
            width: 34px;
            height: 34px;
            background: rgba(17, 35, 56, 0.20);
            border: 1px solid rgba(44, 76, 151, 0.18);
            box-shadow: 0 4px 14px rgba(15, 34, 53, 0.08);
          }

          .tp-popular-nav svg { width: 14px; height: 14px; }
          .tp-popular-prev { left: 8px; }
          .tp-popular-next { right: 8px; }

          .tp-section-title-2 { font-size: 21px; }
          .tp-section-description { font-size: 12.8px; }

          .tp-popular-product-card { max-width: 360px; }
          .tp-popular-product-img-wrapper { min-height: 215px; }
          .tp-popular-product-img { padding: 14px; }

          .tp-popular-badge { top: 12px; left: 12px; }
          .tp-popular-badge-text { font-size: 10px; padding: 5px 10px; }
        }

        @media (max-width: 380px) {
          .tp-section-title-2 { font-size: 20px; }
          .tp-popular-product-title { font-size: 14px; }
          .tp-btn.tp-btn-popular { font-size: 12.5px; padding: 10px 12px; }
        }

        /* Dark Theme Support */
        .theme-dark .tp-popular-products-area { background: var(--tp-grey-1); }
        .theme-dark .tp-popular-product-card { background: var(--tp-common-white); border-color: var(--tp-grey-2); }
        .theme-dark .tp-popular-product-img { background: var(--tp-grey-5); }
      `}</style>
    </section>
  );
}
