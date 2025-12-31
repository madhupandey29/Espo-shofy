'use client';
import React, { useState, useEffect } from 'react';
import ProductItem from '../products/fashion/product-item';
import ShopListItem from './shop-list-item';
import ShopTopLeft from './shop-top-left';
import ShopTopRight from './shop-top-right';
import ShopSidebarFilters from './ShopSidebarFilters';
import ResetButton from './shop-filter/reset-button';
import EmptyState from '@/components/common/empty-state';
// Pagination removed for Load More behavior

const ShopContent = ({
  all_products = [],
  products = [],
  otherProps,
  shop_right,
  hidden_sidebar,
}) => {
  const {
    priceFilterValues,
    selectHandleFilter,
    setCurrPage,
    currPage = 1,
    selectedFilters,
    handleFilterChange,
  } = otherProps;

  const { setPriceValue, priceValue } = priceFilterValues || {};
  const [filteredRows, setFilteredRows] = useState(products);
  const [visibleCount, setVisibleCount] = useState(40);

  // measure header + toolbar to center the empty state
  const [centerOffset, setCenterOffset] = useState(140);
  useEffect(() => {
    const calc = () => {
      const header =
        document.querySelector('.tp-header-area') ||
        document.querySelector('.tp-header-style-primary');
      const toolbar = document.querySelector('.shop-toolbar-sticky');
      const h = header ? header.getBoundingClientRect().height : 0;
      const t = toolbar ? toolbar.getBoundingClientRect().height : 0;
      setCenterOffset(h + t);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    setFilteredRows(products);
    setVisibleCount(Math.min(40, products.length || 0));
    setCurrPage(1);
  }, [products, setCurrPage]);

  const maxPrice = all_products.reduce(
    (m, p) => Math.max(m, +p.salesPrice || +p.price || 0),
    1000
  );

  // any active filters?
  const pv = Array.isArray(priceValue) ? priceValue : [0, maxPrice];
  const priceActive = pv[0] > 0 || pv[1] < maxPrice;
  const facetsActive =
    selectedFilters && Object.values(selectedFilters).some((v) =>
      Array.isArray(v) ? v.length > 0 : !!v
    );
  const anyActive = !!(priceActive || facetsActive);

  // reset handler
  const resetAll = () => {
    setPriceValue?.([0, maxPrice]);
    handleFilterChange?.({});
    setCurrPage?.(1);
  };

  // no pagination; using incremental visibility via Load More

  return (
    <section className="tp-shop-area pb-120">
      <div className="container">
        <div className="row">
          {/* sidebar */}
          {!shop_right && !hidden_sidebar && (
            <aside className="col-xl-3 col-lg-4 d-none d-lg-block">
              <div className="sticky-filter">
                <div className="filter-header d-flex align-items-center justify-content-between">
                  <h3 className="tp-shop-widget-title mb-0">Filter</h3>
                  <ResetButton
                    className="filter-reset-btn"
                    active={anyActive}
                    setPriceValues={setPriceValue}
                    maxPrice={maxPrice}
                    handleFilterChange={handleFilterChange}
                    aria-label="Reset all filters"
                  />
                </div>

                <ShopSidebarFilters
                  selected={selectedFilters}
                  onFilterChange={handleFilterChange}
                  hideTitle={true}
                />
              </div>
            </aside>
          )}

          {/* main */}
          <div className={hidden_sidebar ? 'col-xl-12 col-lg-12' : 'col-xl-9 col-lg-8 col-12'}>
            <div className="tp-shop-main-wrapper">
              <div className="shop-toolbar-sticky">
                <div className="tp-shop-top mb-45">
                  <div className="row">
                     <div className="col-xl-6 mb-10">
                      <ShopTopLeft
                        showing={filteredRows.slice(0, visibleCount).length}
                        total={all_products.length}
                      />
                    </div> 
                    <div className="col-xl-6">
                      <ShopTopRight selectHandleFilter={selectHandleFilter} />
                    </div> 
                  </div>
                </div>
              </div>

              <div className="tp-shop-items-wrapper tp-shop-item-primary">
                {filteredRows.length === 0 ? (
                  <div className="shop-empty" style={{ ['--page-offset']: `${centerOffset}px` }}>
                    <EmptyState
                      title="No products match your filters"
                      subtitle="Try adjusting your filters or explore more categories."
                      tips={['Clear some filters', 'Try a different category', 'Widen the price range']}
                      primaryAction={{ label: 'Reset all filters', onClick: resetAll }}
                      secondaryAction={{ label: 'Browse all products', href: '/fabric' }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="tab-content" id="productTabContent">
                      <div className="tab-pane fade show active" id="grid-tab-pane">
                        {/* ✅ Use products-grid instead of bootstrap row */}
                        <div className="products-grid">
                          {filteredRows
                            .slice(0, visibleCount)
                            .map((item) => (
                              <ProductItem key={item._id} product={item} />
                            ))}
                        </div>
                      </div>

                      <div className="tab-pane fade" id="list-tab-pane">
                        <div className="tp-shop-list-wrapper tp-shop-item-primary mb-70">
                          {filteredRows
                            .slice(0, visibleCount)
                            .map((item) => (
                              <ShopListItem key={item._id} product={item} />
                            ))}
                        </div>
                      </div>
                    </div>

                    {visibleCount < filteredRows.length && (
                      <div className="row">
                        <div className="col-xl-12">
                          <div className="load-more-wrapper mt-30">
                            <button
                              type="button"
                              className="load-more-btn"
                              onClick={() => setVisibleCount(filteredRows.length)}
                            >
                              Load more
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {shop_right && <aside className="col-xl-3 col-lg-4 d-none d-lg-block"></aside>}
        </div>
      </div>

      <style jsx>{`
        .shop-empty {
          min-height: calc(100vh - var(--page-offset, 140px));
          display: grid;
          place-items: center;
          padding: 8px 0;
        }
        .load-more-wrapper { display: flex; justify-content: center; }
      .load-more-btn {
  background: var(--tp-theme-primary);
  color: var(--tp-common-white);
  border: 2px solid var(--tp-theme-primary);
  padding: 14px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: var(--tp-ff-roboto);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--tp-theme-primary) 25%, transparent);
}

.load-more-btn:hover {
  background: var(--tp-common-white);
  color: var(--tp-theme-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--tp-theme-primary) 35%, transparent);
}

.load-more-btn:active {
  transform: translateY(0);
}
      `}</style>
    </section>
  );
};

export default ShopContent;
