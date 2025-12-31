'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/* ---- constants ---- */
const HERO_VIDEO = '/videos/canva_mix.mp4';
const STATIC_FALLBACK = '/assets/img/hero/hero-bg.jpg';

const EYEBROW = 'Your One-Stop Fabric Destination';
const TITLE = "India's Trusted Fabric Manufacturer";
const SUBTITLE =
  'From timeless cottons to new-age blends — explore fabrics that define style and durability.';
const CTA = { href: '/shop', label: 'Discover Now' };

export default function FashionBanner() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVideoLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="fashion-hero" role="banner" aria-label="Hero Banner">
      {/* Background */}
      <div className="hero-bg" aria-hidden="true">
        <video
          className={`hero-video ${videoLoaded ? 'loaded' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          onError={(e) => {
            console.error('Video loading error:', e);
            // hide video, fallback will show
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        <div
          className="hero-fallback"
          style={{ backgroundImage: `url(${STATIC_FALLBACK})` }}
        />

        <div className="bg-overlay primary-overlay" />
        <div className="bg-overlay accent-overlay" />
      </div>

      {/* Content */}
      <div className="container">
        <div className="hero-content">
          <div className="eyebrow-badge">
            <span className="badge-text">{EYEBROW}</span>
            <div className="badge-line" />
          </div>

          <h1 className="main-title">
            <span className="title-line">India&apos;s Trusted</span>
            <span className="title-line accent-line">Fabric Manufacturer</span>
          </h1>

          <p className="subtitle">{SUBTITLE}</p>

          <div className="cta-section">
            <Link href={CTA.href} className="cta-btn" aria-label={CTA.label}>
              <span className="btn-text">{CTA.label}</span>
              <span className="btn-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>

          <div className="metrics-grid" role="list" aria-label="Trust Metrics">
            <div className="metric-item" role="listitem">
              <div className="metric-number">500+</div>
              <div className="metric-label">Fabric Varieties</div>
            </div>

            <div className="metric-divider" aria-hidden="true" />

            <div className="metric-item" role="listitem">
              <div className="metric-number">25+</div>
              <div className="metric-label">Years Experience</div>
            </div>

            <div className="metric-divider" aria-hidden="true" />

            <div className="metric-item" role="listitem">
              <div className="metric-number">1000+</div>
              <div className="metric-label">Happy Clients</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* ===== HERO SECTION ===== */
        .fashion-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 700px;
          max-height: 900px;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: var(--tp-theme-1);
        }

        /* ===== BACKGROUND ===== */
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: none; /* IMPORTANT: cover for mobile */
          object-position: center;
          opacity: 0;
          transition: opacity 0.9s ease;
        }

        .hero-video.loaded {
          opacity: 0.6;
        }

        .hero-fallback {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: brightness(0.5);
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .primary-overlay {
          background: linear-gradient(
            135deg,
            rgba(15, 34, 53, 0.9) 0%,
            rgba(44, 76, 151, 0.7) 50%,
            rgba(15, 34, 53, 0.9) 100%
          );
        }

        .accent-overlay {
          background: radial-gradient(
            circle at 30% 45%,
            rgba(214, 167, 75, 0.15) 0%,
            transparent 70%
          );
        }

        /* ===== CONTENT ===== */
        .container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--page-xpad);
        }

        .hero-content {
          text-align: center;
          color: var(--tp-common-white);
        }

        /* Eyebrow */
        .eyebrow-badge {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
        }

        .badge-text {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--tp-theme-secondary);
          font-family: var(--tp-ff-jost);
        }

        .badge-line {
          width: 60px;
          height: 2px;
          background: var(--tp-theme-secondary);
        }

        /* Title */
        .main-title {
          font-family: var(--tp-ff-jost);
          font-weight: 700;
          line-height: 1.08;
          margin: 0 0 18px;
        }

        .title-line {
          display: block;
          font-size: 3.5rem;
          color: var(--tp-common-white);
        }

        .accent-line {
          background: linear-gradient(
            135deg,
            var(--tp-common-white) 30%,
            var(--tp-theme-secondary) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Subtitle */
        .subtitle {
          max-width: 640px;
          margin: 0 auto 34px;
          font-size: 18px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.9);
          font-family: var(--tp-ff-roboto);
          font-weight: 400;
        }

        /* CTA */
        .cta-section {
          margin-bottom: 42px;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 42px;
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border: 2px solid transparent;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          font-family: var(--tp-ff-jost);
          transition: transform 0.25s ease, box-shadow 0.25s ease,
            border-color 0.25s ease;
          position: relative;
          overflow: hidden;
          min-height: 48px;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--tp-theme-secondary);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(44, 76, 151, 0.3);
          border-color: var(--tp-theme-secondary);
        }

        .cta-btn:hover::before {
          opacity: 1;
        }

        .btn-text,
        .btn-icon {
          position: relative;
          z-index: 1;
        }

        .btn-icon {
          transition: transform 0.25s ease;
        }

        .cta-btn:hover .btn-icon {
          transform: translateX(4px);
        }

        /* Metrics */
        .metrics-grid {
          display: inline-flex;
          align-items: center;
          gap: 28px;
          padding: 22px 34px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .metric-item {
          text-align: center;
          min-width: 120px;
        }

        .metric-number {
          font-size: 28px;
          font-weight: 700;
          color: var(--tp-theme-secondary);
          font-family: var(--tp-ff-jost);
          margin-bottom: 4px;
          line-height: 1;
        }

        .metric-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
          font-family: var(--tp-ff-roboto);
        }

        .metric-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
        }

        /* ===== RESPONSIVE ===== */

        /* Desktop */
        @media (max-width: 1200px) {
          .fashion-hero {
            min-height: 650px;
            max-height: 800px;
          }
          .title-line {
            font-size: 3.2rem;
          }
        }

        /* Tablet */
        @media (max-width: 992px) {
          .fashion-hero {
            height: auto; /* allow hero to fit content */
            min-height: 600px;
            max-height: none;
            padding: 96px 0;
          }
          .title-line {
            font-size: 2.7rem;
          }
          .subtitle {
            font-size: 17px;
            margin-bottom: 30px;
          }
          .cta-section {
            margin-bottom: 36px;
          }
          .metrics-grid {
            gap: 20px;
            padding: 18px 28px;
          }
          .metric-number {
            font-size: 24px;
          }
        }

        /* Mobile + short hero (THIS is the key) */
        @media (max-width: 576px) {
          .fashion-hero {
            height: auto; /* stop forcing 100vh */
            min-height: 0; /* let it shrink */
            max-height: none;
            padding: 68px 0 56px; /* smaller, still comfortable */
          }

          .eyebrow-badge {
            margin-bottom: 18px; /* smaller */
            gap: 8px;
          }

          .badge-text {
            font-size: 11px;
            letter-spacing: 1.2px;
          }

          .badge-line {
            width: 48px;
          }

          .title-line {
            font-size: 1.95rem; /* smaller to fit */
          }

          .main-title {
            margin-bottom: 12px;
            line-height: 1.06;
          }

          .subtitle {
            font-size: 14px;
            line-height: 1.45;
            margin: 0 auto 18px;
            max-width: 320px;
          }

          .cta-section {
            margin-bottom: 18px;
          }

          .cta-btn {
            padding: 12px 22px;
            font-size: 14px;
            border-radius: 10px;
            min-height: 44px;
          }

          /* Make metrics compact and not tall */
          .metrics-grid {
            width: min(320px, 92vw);
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            padding: 12px 12px;
            border-radius: 14px;
          }

          .metric-divider {
            display: none; /* remove dividers in grid */
          }

          .metric-item {
            min-width: 0;
            padding: 6px 4px;
          }

          .metric-number {
            font-size: 18px;
            margin-bottom: 2px;
          }

          .metric-label {
            font-size: 10px;
            letter-spacing: 0.6px;
            line-height: 1.15;
          }
        }

        /* Very small phones */
        @media (max-width: 400px) {
          .fashion-hero {
            padding: 62px 0 50px;
          }
          .title-line {
            font-size: 1.75rem;
          }
          .subtitle {
            font-size: 13.5px;
            max-width: 300px;
          }
          .metrics-grid {
            width: min(300px, 92vw);
          }
          .metric-number {
            font-size: 17px;
          }
          .metric-label {
            font-size: 9.5px;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        .hero-video {
          will-change: opacity;
        }

        .cta-btn:focus-visible {
          outline: 2px solid var(--tp-theme-secondary);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-btn,
          .hero-video {
            transition: none;
          }
          .cta-btn:hover {
            transform: none;
          }
          .cta-btn:hover .btn-icon {
            transform: none;
          }
        }

        /* Dark theme */
        .theme-dark .fashion-hero {
          background: var(--tp-theme-1);
        }
        .theme-dark .primary-overlay {
          background: linear-gradient(
            135deg,
            rgba(15, 34, 53, 0.95) 0%,
            rgba(44, 76, 151, 0.8) 50%,
            rgba(15, 34, 53, 0.95) 100%
          );
        }
      `}</style>
    </section>
  );
}
