'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleFilterSidebarClose } from '@/redux/features/shop-filter-slice';
import ResetButton from '../shop/shop-filter/reset-button';
import ShopSidebarFilters, {
  FilterOnly as MobileFilterFlyout,
  FILTERS_MAP,
} from '../shop/ShopSidebarFilters';

const KEYCODES = { ESC: 27 };

const ShopFilterOffCanvas = ({ all_products, otherProps, right_side = false }) => {
  const { priceFilterValues, selectedFilters, handleFilterChange } = otherProps;
  const { filterSidebar } = useSelector((state) => state.shopFilter);
  const dispatch = useDispatch();

  const drawerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [singleKey, setSingleKey] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // ---------- Design (calm + clean) ----------
  const styles = {
    offcanvas: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      pointerEvents: 'none',
      transition: 'opacity 0.25s ease-out',
    },
    offcanvasOpened: {
      pointerEvents: 'all',
    },
    wrapper: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      maxWidth: '420px',
      height: '100vh',
      background: 'var(--tp-common-white)',
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
      transform: 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1001,
      overflow: 'hidden',
      borderRadius: '0 18px 18px 0',
    },
    wrapperOpen: {
      transform: 'translateX(0)',
    },
    header: {
      background: 'var(--tp-common-white)',
      borderBottom: '1px solid var(--tp-grey-2)',
      padding: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    headerContent: {
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    },
    closeBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '8px 14px',
      background: 'var(--tp-grey-1)',
      border: '1px solid var(--tp-grey-3)',
      borderRadius: '999px',
      color: 'var(--tp-text-1)',
      fontFamily: 'var(--tp-ff-roboto)',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease-out',
      flexShrink: 0,
      boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
    },
    closeBtnHover: {
      background: 'var(--tp-theme-primary)',
      borderColor: 'var(--tp-theme-primary)',
      color: 'var(--tp-common-white)',
      boxShadow: '0 8px 18px rgba(44, 76, 151, 0.25)',
    },
    titleSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      paddingRight: '24px',
    },
    title: {
      margin: 0,
      fontFamily: 'var(--tp-ff-jost)',
      fontSize: '22px',
      fontWeight: 700,
      color: 'var(--tp-text-1)',
      lineHeight: 1.25,
      letterSpacing: '0.01em',
    },
    subtitle: {
      marginTop: '4px',
      fontFamily: 'var(--tp-ff-roboto)',
      fontSize: '14px',
      color: 'var(--tp-text-2)',
      lineHeight: 1.4,
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--tp-grey-1)',
    },
    scroll: {
      flex: 1,
      overflowY: 'auto',
      padding: '22px',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--tp-grey-7) transparent',
    },
    filterSection: {
      background: 'var(--tp-common-white)',
      borderRadius: '18px',
      border: '1px solid var(--tp-grey-2)',
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
    },
    footer: {
      background: 'var(--tp-common-white)',
      borderTop: '1px solid var(--tp-grey-2)',
      padding: '18px 22px',
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
      opacity: 0,
      visibility: 'hidden',
      transition: 'opacity 0.25s ease-out, visibility 0.25s ease-out',
    },
    overlayOpened: {
      opacity: 1,
      visibility: 'visible',
    },
    // mobile tweaks
    mobileWrapper: {
      maxWidth: '100%',
      borderRadius: 0,
      boxShadow: '0 -6px 24px rgba(15, 23, 42, 0.22)',
    },
    mobileHeaderContent: {
      padding: '16px 18px',
    },
    mobileScroll: {
      padding: '18px',
    },
    mobileFooter: {
      padding: '16px 18px 20px',
    },
    mobileTitle: {
      fontSize: '20px',
    },
  };

  const maxPrice = all_products.reduce((max, product) => {
    const val = Number(product?.price ?? 0);
    return val > max ? val : max;
  }, 0);

  const applyAndClose = (nextSelected) => {
    handleFilterChange(nextSelected);
    dispatch(handleFilterSidebarClose());
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  // ESC close + lock scroll
  useEffect(() => {
    if (!filterSidebar) return;

    const handleKey = (e) => {
      if (e.keyCode === KEYCODES.ESC) {
        if (singleKey) setSingleKey(null);
        else dispatch(handleFilterSidebarClose());
      }
    };

    const firstFocusable = drawerRef.current;
    firstFocusable && firstFocusable.focus();

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [filterSidebar, singleKey, dispatch]);

  return (
    <>
      <div
        style={{
          ...styles.offcanvas,
          ...(filterSidebar && styles.offcanvasOpened),
        }}
        aria-hidden={!filterSidebar}
        aria-modal="true"
        role="dialog"
      >
        <div
          style={{
            ...styles.wrapper,
            ...(filterSidebar && styles.wrapperOpen),
            ...(isMobile && styles.mobileWrapper),
          }}
          ref={wrapperRef}
          data-state={filterSidebar ? 'open' : 'closed'}
        >
          {/* Header */}
          <div style={styles.header}>
            <div
              style={{
                ...styles.headerContent,
                ...(isMobile && styles.mobileHeaderContent),
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (singleKey) {
                    setSingleKey(null);
                    return;
                  }
                  dispatch(handleFilterSidebarClose());
                }}
                style={{
                  ...styles.closeBtn,
                  ...(isHovered && styles.closeBtnHover),
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={singleKey ? 'Back to all filters' : 'Close filters'}
                title={singleKey ? 'Back' : 'Close'}
                ref={drawerRef}
              >
                <i
                  className={`fa-solid ${singleKey ? 'fa-arrow-left' : 'fa-xmark'}`}
                  style={{ fontSize: '14px', width: '14px', height: '14px' }}
                />
                <span>{singleKey ? 'Back' : 'Close'}</span>
              </button>

              {!singleKey && (
                <div style={styles.titleSection}>
                  <h3
                    style={{
                      ...styles.title,
                      ...(isMobile && styles.mobileTitle),
                    }}
                  >
                    Filters
                  </h3>
                  <span style={styles.subtitle}>Refine your results</span>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={styles.content}>
            {singleKey ? (
              <MobileFilterFlyout
                filter={FILTERS_MAP[singleKey]}
                selected={selectedFilters}
                onApply={(nextSelected) => {
                  applyAndClose(nextSelected);
                  setSingleKey(null);
                }}
                onCancel={() => setSingleKey(null)}
                portalTarget={wrapperRef.current}
              />
            ) : (
              <>
                <div
                  style={{
                    ...styles.scroll,
                    ...(isMobile && styles.mobileScroll),
                  }}
                >
                  <div style={styles.filterSection}>
                    <ShopSidebarFilters
                      selected={selectedFilters}
                      onFilterChange={applyAndClose}
                      mobile
                      mobileSingle
                      onOpenFilter={(key) => setSingleKey(key)}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    ...styles.footer,
                    ...(isMobile && styles.mobileFooter),
                  }}
                >
                  <ResetButton
                    shop_right={right_side}
                    setPriceValues={priceFilterValues?.setPriceValue}
                    maxPrice={maxPrice}
                    handleFilterChange={applyAndClose}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        onClick={() => dispatch(handleFilterSidebarClose())}
        style={{
          ...styles.overlay,
          ...(filterSidebar && styles.overlayOpened),
        }}
        aria-hidden
      />
    </>
  );
};

export default ShopFilterOffCanvas;
