'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsArrowRight } from 'react-icons/bs';

const feature_data = [
  { title: 'Fast Dispatch' },
  { title: '5000+ Fabrics' },
  { title: 'Quality Control' },
  { title: 'Transparent Pricing' },
  { title: 'Low MOQ' },
  { title: 'Dedicated Support' },
  { title: 'Development Support' },
  { title: 'Shade Consistency' },
  { title: 'QC check' },
  { title: 'Trustable Supplier' },
];

export default function AboutSection({
  eyebrow = 'ABOUT US',
  title = (
    <>
      Trusted Fabric Partner for <span className="tp-about__hl">B2B Bulk Supply</span>
    </>
  ),
  description = (
    <>
      <strong className="tp-about__brand">Amrita Global Enterprises</strong> is a dependable textile sourcing and
      fabric supply partner based in Ahmedabad, India—supporting manufacturers, exporters, uniform producers,
      and buying houses with consistent quality and program-ready supply. We help you move smoothly from
      sampling to bulk with repeat-order stability, shade consistency, and clear approvals to reduce risk in
      production. With transparent pricing, flexible MOQ options for new styles, and dispatch planning aligned
      to timelines, we make bulk sourcing simpler and faster. Backed by strong QC practices and a trusted
      supplier network, Amrita Global Enterprises focuses on long-term partnerships built on reliability,
      responsiveness, and performance.
    </>
  ),
  ctaText = 'Know More',
  ctaHref = '/contact',
  imageSrc = '/assets/img/banner/2/p2.jpg',
  imageAlt = 'About our fabric sourcing and quality process',
  variant = 'light', // "light" | "dark"
}) {
  return (
    <section className={`tp-about ${variant === 'dark' ? 'tp-about--dark' : ''}`}>
      <div className="container">
        <div className="tp-about__grid">
          <div className="tp-about__left">
            {/* Header */}
            <div className="tp-about__head">
              <span className="tp-about__eyebrow">
                <span className="tp-about__line" />
                {eyebrow}
              </span>

              <h2 className="tp-about__title">{title}</h2>
            </div>

            {/* Image */}
            <div className="tp-about__right">
              <div className="tp-about__imgWrap">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 992px) 100vw, 50vw"
                  className="tp-about__img"
                  priority={false}
                />

                <div className="tp-about__badge">Premium Quality</div>
                <div className="tp-about__shine" />
              </div>
            </div>

            {/* Body */}
            <div className="tp-about__body">
              <p className="tp-about__desc">{description}</p>

              <div className="tp-about__ctaRow">
                <Link href={ctaHref} className="tp-about__cta">
                  {ctaText} <BsArrowRight />
                </Link>
              </div>

              <div className="tp-about__features">
                {feature_data.map((f) => (
                  <div className="tp-about__pill" key={f.title}>
                    {f.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* =========================
           ABOUT SECTION
           ========================= */

        .tp-about {
          padding: 72px 0;
          background: var(--tp-grey-1);
          position: relative;
          overflow: hidden;
        }

        .tp-about.tp-about--dark {
          background: radial-gradient(900px 400px at 10% 20%, rgba(44, 76, 151, 0.28), transparent 60%),
            radial-gradient(900px 400px at 20% 80%, rgba(214, 167, 75, 0.18), transparent 55%),
            linear-gradient(135deg, #071827 0%, #0b2338 45%, #071827 100%);
        }

        /* Desktop layout */
        .tp-about__grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        .tp-about__left {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          grid-template-rows: auto auto;
          gap: 42px;
          align-items: center;
        }

        .tp-about__head {
          grid-column: 1;
          grid-row: 1;
        }

        .tp-about__body {
          grid-column: 1;
          grid-row: 2;
        }

        .tp-about__right {
          grid-column: 2;
          grid-row: 1 / span 2;
        }

        .tp-about__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--tp-ff-jost);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: var(--tp-theme-primary);
          padding: 6px 14px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--tp-theme-primary) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--tp-theme-primary) 18%, transparent);
          margin-bottom: 16px;
        }

        .tp-about__line {
          width: 26px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--tp-theme-primary), var(--tp-theme-secondary));
        }

        .tp-about__title {
          font-family: var(--tp-ff-jost);
          font-size: 40px;
          line-height: 1.15;
          font-weight: 800;
          margin: 0 0 14px 0;
          color: var(--tp-text-1);
          letter-spacing: -0.2px;
        }

        .tp-about__hl {
          background: linear-gradient(135deg, var(--tp-theme-primary), var(--tp-theme-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tp-about__desc {
          font-family: var(--tp-ff-roboto);
          font-size: 15px;
          line-height: 1.8;
          margin: 0 0 16px 0;
          color: var(--tp-text-2);
          max-width: 560px;
        }

        .tp-about__brand {
          font-family: var(--tp-ff-jost);
          font-weight: 800;
          font-size: 25px;
          color: var(--tp-text-1);
          background: linear-gradient(135deg, var(--tp-theme-primary), var(--tp-theme-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        .tp-about__ctaRow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .tp-about__cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--tp-theme-primary) 28%, transparent);
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          font: 700 14px/1 var(--tp-ff-jost);
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease,
            border-color 0.2s ease;
          box-shadow: 0 10px 26px rgba(15, 34, 53, 0.06);
        }

        .tp-about__cta:hover {
          transform: translateY(-2px);
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          border-color: var(--tp-theme-primary);
          box-shadow: 0 18px 34px rgba(44, 76, 151, 0.22);
        }

        .tp-about__cta svg {
          transition: transform 0.2s ease;
        }
        .tp-about__cta:hover svg {
          transform: translateX(3px);
        }

        .tp-about__features {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 10px;
        }

        .tp-about__pill {
          padding: 11px 14px;
          border-radius: 14px;
          background: var(--tp-common-white);
          border: 1px solid color-mix(in srgb, var(--tp-common-black) 10%, transparent);
          color: var(--tp-text-1);
          font: 700 13px/1 var(--tp-ff-jost);
          box-shadow: 0 10px 22px rgba(15, 34, 53, 0.06);
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
          user-select: none;
        }

        .tp-about__pill:hover {
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--tp-theme-primary) 40%, transparent);
          box-shadow: 0 16px 30px rgba(44, 76, 151, 0.12);
        }

        .tp-about__imgWrap {
          position: relative;
          width: 100%;
          height: 420px;
          border-radius: 22px;
          overflow: hidden;
          background: #eef2f6;
          box-shadow: 0 24px 48px rgba(15, 34, 53, 0.1);
          border: 1px solid color-mix(in srgb, var(--tp-common-black) 10%, transparent);
        }

        .tp-about__img {
          object-fit: cover;
          transform: scale(1.01);
          transition: transform 0.5s ease;
        }

        .tp-about__imgWrap:hover .tp-about__img {
          transform: scale(1.06);
        }

        .tp-about__badge {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 3;
          padding: 8px 14px;
          border-radius: 999px;
          color: var(--tp-common-white);
          font: 700 12px/1 var(--tp-ff-jost);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          background: linear-gradient(135deg, var(--tp-theme-primary), var(--tp-theme-secondary));
          box-shadow: 0 10px 22px rgba(44, 76, 151, 0.25);
        }

        .tp-about__shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: radial-gradient(450px 260px at 20% 20%, rgba(255, 255, 255, 0.25), transparent 60%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.12), transparent 40%, rgba(0, 0, 0, 0.12));
          pointer-events: none;
          mix-blend-mode: overlay;
          opacity: 0.6;
        }

        /* Dark variant text tuning */
        .tp-about--dark .tp-about__title,
        .tp-about--dark .tp-about__pill {
          color: #e7edf6;
        }
        .tp-about--dark .tp-about__desc {
          color: rgba(231, 237, 246, 0.82);
        }
        .tp-about--dark .tp-about__pill,
        .tp-about--dark .tp-about__cta {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .tp-about--dark .tp-about__pill:hover {
          border-color: rgba(214, 167, 75, 0.45);
        }

        /* =========================
           ✅ RESPONSIVE (Compact + clean on mobile)
           Order stays: Heading -> Image -> Body
           Desktop unchanged
           ========================= */

        @media (max-width: 1200px) {
          .tp-about__title {
            font-size: 36px;
          }
          .tp-about__imgWrap {
            height: 390px;
          }
        }

        @media (max-width: 992px) {
          .tp-about {
            padding: 56px 0;
          }

          .tp-about__left {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
            gap: 16px; /* more compact */
            align-items: start;
          }

          .tp-about__head {
            grid-column: 1;
            grid-row: 1;
          }

          .tp-about__right {
            grid-column: 1;
            grid-row: 2;
          }

          .tp-about__body {
            grid-column: 1;
            grid-row: 3;
          }

          .tp-about__eyebrow {
            font-size: 11px;
            padding: 6px 12px;
            margin-bottom: 12px;
          }

          .tp-about__title {
            font-size: 30px;
            margin-bottom: 10px;
          }

          .tp-about__desc {
            font-size: 14px;
            line-height: 1.75;
            margin-bottom: 14px;
            max-width: 100%;
          }

          .tp-about__brand {
            font-size: 20px; /* was 25 -> compact */
          }

          .tp-about__ctaRow {
            margin-bottom: 14px;
          }

          .tp-about__cta {
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
          }

          .tp-about__imgWrap {
            height: 320px;
            border-radius: 20px;
          }

          .tp-about__badge {
            top: 14px;
            right: 14px;
            padding: 7px 12px;
            font-size: 11px;
          }

          .tp-about__features {
            gap: 10px;
          }

          .tp-about__pill {
            padding: 10px 12px;
            border-radius: 14px;
            font-size: 12px;
          }
        }

        @media (max-width: 576px) {
          .tp-about {
            padding: 44px 0; /* tighter section */
          }

          .tp-about__line {
            width: 22px;
          }

          .tp-about__title {
            font-size: 26px;
            line-height: 1.18;
          }

          .tp-about__desc {
            font-size: 13.5px;
            line-height: 1.7;
            margin-bottom: 12px;
          }

          .tp-about__brand {
            font-size: 18px;
            white-space: normal; /* prevent overflow on small phones */
          }

          .tp-about__imgWrap {
            height: 240px;
            border-radius: 18px;
            box-shadow: 0 18px 36px rgba(15, 34, 53, 0.09);
          }

          .tp-about__img {
            transform: scale(1);
          }

          .tp-about__badge {
            top: 12px;
            right: 12px;
            padding: 6px 10px;
            font-size: 10px;
            letter-spacing: 0.6px;
          }

          .tp-about__cta {
            width: 100%;
            justify-content: center;
            padding: 11px 14px;
            border-radius: 12px;
          }

          .tp-about__features {
            gap: 8px;
            margin-top: 8px;
          }

          .tp-about__pill {
            padding: 9px 11px;
            border-radius: 13px;
            font-size: 12px;
            box-shadow: 0 8px 18px rgba(15, 34, 53, 0.05);
          }
        }

        @media (max-width: 380px) {
          .tp-about__title {
            font-size: 24px;
          }
          .tp-about__imgWrap {
            height: 220px;
          }
        }
      `}</style>
    </section>
  );
}
