'use client';
import React from 'react';

export default function EmptyState({
  title = 'No products match your filters',
  subtitle = 'Try adjusting your filters or explore more categories.',
  className = '',
  tips = [],
  primaryAction = null,
  secondaryAction = null,
}) {
  return (
    <div className={`empty-state ${className}`}>
      {/* Theme-matching icon */}
      <div className="empty-icon-container">
        <div className="empty-icon-bg"></div>
        <div className="empty-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            {/* Document/Product icon */}
            <rect x="15" y="12" width="30" height="36" rx="4" fill="none" stroke="var(--tp-theme-primary)" strokeWidth="2"/>
            <rect x="18" y="18" width="24" height="2" rx="1" fill="var(--tp-theme-primary)" opacity="0.3"/>
            <rect x="18" y="23" width="18" height="2" rx="1" fill="var(--tp-theme-primary)" opacity="0.3"/>
            <rect x="18" y="28" width="21" height="2" rx="1" fill="var(--tp-theme-primary)" opacity="0.3"/>
            
            {/* Search magnifying glass */}
            <circle cx="36" cy="33" r="8" fill="none" stroke="var(--tp-theme-secondary)" strokeWidth="2"/>
            <path d="42 39l5 5" stroke="var(--tp-theme-secondary)" strokeWidth="2" strokeLinecap="round"/>
            
            {/* X mark indicating no results */}
            <path d="31 28l10 10M41 28l-10 10" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            
            {/* Decorative elements */}
            <circle cx="12" cy="15" r="1.5" fill="var(--tp-theme-secondary)" opacity="0.6"/>
            <circle cx="51" cy="18" r="1" fill="var(--tp-theme-secondary)" opacity="0.4"/>
            <circle cx="9" cy="45" r="1.5" fill="var(--tp-theme-primary)" opacity="0.3"/>
          </svg>
        </div>
      </div>

      <div className="empty-content">
        <h3 className="empty-title">{title}</h3>
        {subtitle && <p className="empty-subtitle">{subtitle}</p>}
        
        {tips && tips.length > 0 && (
          <div className="empty-tips">
            {tips.map((tip, index) => (
              <div key={index} className="tip-item">
                <div className="tip-icon">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" fill="var(--tp-theme-secondary)"/>
                    <path d="M4 6l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="empty-actions">
            {primaryAction && (
              <button
                type="button"
                className="btn-primary"
                onClick={primaryAction.onClick}
              >
                <span className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M7 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <a href={secondaryAction.href} className="btn-secondary">
                <span className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 10l2-2-2-2M5 5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {secondaryAction.label}
              </a>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          background: var(--tp-common-white);
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--tp-theme-primary) 15%, transparent);
          box-shadow: 
            0 4px 12px -2px color-mix(in srgb, var(--tp-theme-primary) 8%, transparent),
            0 2px 4px -1px color-mix(in srgb, var(--tp-theme-primary) 5%, transparent);
          position: relative;
          overflow: hidden;
          animation: slideUp 0.4s ease-out;
        }

        .empty-state::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            var(--tp-theme-primary) 0%, 
            var(--tp-theme-secondary) 50%, 
            var(--tp-theme-primary) 100%);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-icon-container {
          position: relative;
          margin-bottom: 20px;
        }

        .empty-icon-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, 
            color-mix(in srgb, var(--tp-theme-primary) 8%, transparent) 0%, 
            color-mix(in srgb, var(--tp-theme-secondary) 5%, transparent) 50%,
            transparent 100%);
          border-radius: 50%;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.6; }
        }

        .empty-icon {
          position: relative;
          z-index: 2;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .empty-content {
          max-width: 400px;
          position: relative;
          z-index: 1;
        }

        .empty-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--tp-text-1);
          margin: 0 0 8px 0;
          line-height: 1.3;
          letter-spacing: -0.025em;
          font-family: var(--tp-ff-jost);
        }

        .empty-subtitle {
          font-size: 14px;
          color: var(--tp-text-2);
          margin: 0 0 24px 0;
          line-height: 1.5;
          font-family: var(--tp-ff-roboto);
        }

        .empty-tips {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
          text-align: left;
        }

        .tip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--tp-text-2);
          font-weight: 500;
          padding: 8px 12px;
          background: color-mix(in srgb, var(--tp-theme-primary) 3%, transparent);
          border-radius: 6px;
          border: 1px solid color-mix(in srgb, var(--tp-theme-primary) 10%, transparent);
          transition: all 0.3s ease;
          font-family: var(--tp-ff-roboto);
        }

        .tip-item:hover {
          transform: translateX(2px);
          background: color-mix(in srgb, var(--tp-theme-primary) 5%, transparent);
          border-color: color-mix(in srgb, var(--tp-theme-primary) 20%, transparent);
        }

        .tip-icon {
          flex-shrink: 0;
        }

        .empty-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--tp-ff-roboto);
          min-width: 130px;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          box-shadow: 0 2px 8px color-mix(in srgb, var(--tp-theme-primary) 25%, transparent);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          background: color-mix(in srgb, var(--tp-theme-primary) 90%, black);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--tp-theme-primary) 35%, transparent);
        }

        .btn-secondary {
          background: var(--tp-common-white);
          color: var(--tp-theme-primary);
          border: 1px solid var(--tp-theme-primary);
          box-shadow: 0 1px 4px color-mix(in srgb, var(--tp-theme-primary) 15%, transparent);
        }

        .btn-secondary:hover {
          background: var(--tp-theme-primary);
          color: var(--tp-common-white);
          transform: translateY(-1px);
          box-shadow: 0 3px 10px color-mix(in srgb, var(--tp-theme-primary) 25%, transparent);
        }

        .btn-icon {
          display: flex;
          align-items: center;
        }

        @media (max-width: 640px) {
          .empty-state {
            padding: 30px 16px;
            border-radius: 10px;
          }

          .empty-title {
            font-size: 20px;
          }

          .empty-subtitle {
            font-size: 13px;
          }

          .empty-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            min-width: auto;
          }

          .tip-item {
            font-size: 12px;
            padding: 6px 10px;
          }
        }

        /* Dark theme support */
        .theme-dark .empty-state {
          background: var(--tp-common-white);
          border-color: color-mix(in srgb, var(--tp-theme-primary) 20%, transparent);
        }

        .theme-dark .empty-title {
          color: var(--tp-text-1);
        }

        .theme-dark .empty-subtitle {
          color: var(--tp-text-2);
        }

        .theme-dark .tip-item {
          background: color-mix(in srgb, var(--tp-theme-primary) 8%, transparent);
          color: var(--tp-text-2);
        }
      `}</style>
    </div>
  );
}
