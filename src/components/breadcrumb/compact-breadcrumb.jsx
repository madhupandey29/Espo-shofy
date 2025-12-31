'use client';
import React from 'react';

const CompactBreadcrumb = ({ title = "Wishlist", subtitle = "Wishlist" }) => {
  return (
    <>
      <section className="compact-breadcrumb">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">{title}</h1>
            <div className="breadcrumb-nav">
              <a href="/" className="breadcrumb-link">Home</a>
              <span className="breadcrumb-separator">•</span>
              <span className="breadcrumb-current">{subtitle}</span>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .compact-breadcrumb {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 1px solid #e2e8f0;
          padding: 20px 0;
        }

        .breadcrumb-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin: 0;
          line-height: 1.2;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .breadcrumb-link {
          color: var(--tp-text-2);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: var(--tp-theme-primary);
        }

        .breadcrumb-separator {
          color: var(--tp-grey-8);
          font-weight: 500;
        }

        .breadcrumb-current {
          color: var(--tp-theme-primary);
          font-weight: 500;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .compact-breadcrumb {
            padding: 16px 0;
          }

          .breadcrumb-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .page-title {
            font-size: 24px;
          }

          .breadcrumb-nav {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .compact-breadcrumb {
            padding: 12px 0;
          }

          .page-title {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default CompactBreadcrumb;