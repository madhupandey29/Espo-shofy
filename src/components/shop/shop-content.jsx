'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import ProductItem from '../products/fashion/product-item';
import ShopTopLeft from './shop-top-left';
import EnhancedShopSidebarFilters from './EnhancedShopSidebarFilters';
import EmptyState from '@/components/common/empty-state';
import { handleFilterSidebarOpen } from '@/redux/features/shop-filter-slice';
import { Filter } from '@/svg';

const ShopContent = ({
  all_products = [],
  products = [],
  otherProps,
  shop_right,
  hidden_sidebar,
}) => {
  console.log('ShopContent Debug:', { 
    allProductsLength: all_products.length, 
    productsLength: products.length,
    totalProducts: otherProps?.totalProducts 
  });

  const {
    priceFilterValues,
    selectHandleFilter,
    setCurrPage,
    selectedFilters,
    handleFilterChange,
    loadMoreProducts,
    hasMorePages,
    totalProducts,
  } = otherProps || {};

  const { setPriceValue, priceValue } = priceFilterValues || {};
  const [filteredRows, setFilteredRows] = useState(products);
  const dispatch = useDispatch();

  // measure header + toolbar to center empty state
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
    setCurrPage?.(1);
  }, [products, setCurrPage]);

  const maxPrice = useMemo(() => {
    return all_products.reduce(
      (m, p) => Math.max(m, +p.salesPrice || +p.price || 0),
      1000
    );
  }, [all_products]);

  const pv = Array.isArray(priceValue) ? priceValue : [0, maxPrice];
  const priceActive = pv[0] > 0 || pv[1] < maxPrice;

  const facetsActive =
    selectedFilters && Object.values(selectedFilters).some((v) =>
      Array.isArray(v) ? v.length > 0 : !!v
    );

  const anyActive = !!(priceActive || facetsActive);

  const resetAll = () => {
    setPriceValue?.([0, maxPrice]);
    handleFilterChange?.({});
    setCurrPage?.(1);
    
    // Clear search if active - this will be handled by the search component itself
    // We don't need to call handleSearchResults here as it might cause conflicts
  };

  // ✅ Build chips list
  const chips = useMemo(() => {
    const out = [];

    if (selectedFilters) {
      for (const [k, vals] of Object.entries(selectedFilters)) {
        if (!Array.isArray(vals)) continue;
        vals.forEach((v) => {
          out.push({
            id: `${k}:${v}`,
            key: k,
            value: String(v),
          });
        });
      }
    }

    if (priceActive) {
      out.push({
        id: `price:${pv[0]}-${pv[1]}`,
        key: 'price',
        value: `${pv[0]} - ${pv[1]}`,
      });
    }

    return out;
  }, [selectedFilters, priceActive, pv]);

  const removeChip = (chip) => {
    if (!chip) return;

    if (chip.key === 'price') {
      setPriceValue?.([0, maxPrice]);
      return;
    }

    const current = Array.isArray(selectedFilters?.[chip.key]) ? selectedFilters[chip.key] : [];
    const nextArr = current.filter((x) => String(x) !== String(chip.value));
    const next = { ...(selectedFilters || {}) };

    if (nextArr.length) next[chip.key] = nextArr;
    else delete next[chip.key];

    handleFilterChange?.(next);
  };

  return (
    <section className="tp-shop-area pb-120">
      <div className="container">
        <div className="row align-items-start">
          {/* sidebar */}
          {!shop_right && !hidden_sidebar && (
            <aside className="col-auto d-none d-lg-block shop-sidebar-col">
              <div className="sticky-filter">
                <EnhancedShopSidebarFilters
                  selected={selectedFilters}
                  onFilterChange={handleFilterChange}
                  onResetAll={resetAll}
                />
              </div>
            </aside>
          )}

          {/* main */}
          <div className={hidden_sidebar ? 'col-12' : 'col shop-main-col'}>
            <div className="tp-shop-main-wrapper">
              <div className="shop-toolbar-sticky">
                <div className="tp-shop-top">
                  <div className="row align-items-start">
                    <div className="col-xl-7 mb-10">
                      <ShopTopLeft
                        total={totalProducts || all_products.length} // Show total products, not filtered
                        chips={chips}
                        onRemoveChip={removeChip}
                        onClearAll={resetAll}
                      />
                    </div>
                    <div className="col-xl-5">
                      <div className="shopTopRight" role="region" aria-label="Sort toolbar">
                        {/* Sort */}
                        {selectHandleFilter && (
                          <div className="shopSort d-none d-lg-block">
                            <select 
                              onChange={(e) => {
                                if (selectHandleFilter) {
                                  selectHandleFilter({ value: e.target.value });
                                }
                              }} 
                              aria-label="Sort products"
                            >
                              <option value="default">Sort: Recommended</option>
                              <option value="new">What's New</option>
                              <option value="priceLow">Price: Low to High</option>
                              <option value="priceHigh">Price: High to Low</option>
                              <option value="nameAsc">Name: A to Z</option>
                            </select>
                          </div>
                        )}

                        {/* Mobile Filter button */}
                        <div className="shopFilterBtn d-lg-none">
                          <button
                            type="button"
                            className="tp-filter-btn"
                            onClick={() => dispatch(handleFilterSidebarOpen())}
                            aria-label="Open filters"
                          >
                            <span className="tp-filter-icon"><Filter /></span>
                            <span className="tp-filter-label">Filter</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="tp-shop-items-wrapper tp-shop-item-primary">
                {filteredRows.length === 0 ? (
                  <div className="shop-empty" style={{ '--page-offset': `${centerOffset}px` }}>
                    <EmptyState
                      title="No products match your filters"
                      subtitle="Try adjusting your filters."
                      tips={['Clear some filters', 'Try a different category', 'Widen the price range']}
                      primaryAction={{ label: 'Reset all filters', onClick: resetAll }}
                      secondaryAction={{ label: 'Browse all products', href: '/fabric' }}
                    />
                  </div>
                ) : (
                  <>
                    {/* ✅ Grid only */}
                    <div className="products-grid">
                      {filteredRows.map((item, i) => (
                        <ProductItem key={item._id || item.id || i} product={item} index={i} />
                      ))}
                    </div>

                    {/* Load More */}
                    {(products.length < (totalProducts || all_products.length)) && (
                      <div className="load-more-wrapper mt-30">
                        <button
                          type="button"
                          className="load-more-btn"
                          onClick={() => {
                            if (hasMorePages && loadMoreProducts) {
                              loadMoreProducts();
                            }
                          }}
                        >
                          Load More ({(totalProducts || all_products.length) - products.length} more)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {shop_right && <aside className="col-xl-3 col-lg-4 d-none d-lg-block" />}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .tp-shop-main-wrapper { overflow: visible; }
        .tp-shop-top{ padding: 14px 0; border-bottom: 1px solid var(--tp-grey-2); }
        .shop-empty {
          min-height: calc(100vh - var(--page-offset, 140px));
          display: grid;
          place-items: center;
          padding: 8px 0;
        }
        .shop-sidebar-col {
          flex: 0 0 270px;
          max-width: 270px;
          padding-left: 0;
        }
        .shop-main-col { min-width: 0; }
        .products-grid{
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap:18px;
          width:100%;
          margin-top: 18px;
        }
        @media (min-width: 1200px){
          .products-grid{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        .load-more-wrapper{ display:flex; justify-content:center; }
        @media (max-width: 991.98px){
          .shop-sidebar-col{ flex:1 1 auto; max-width:100%; }
        }
        .shopTopRight{
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:12px;
        }
        .shopSort select{
          height:44px;
          border:1px solid var(--tp-grey-2);
          border-radius:10px;
          padding:0 12px;
          background:var(--tp-common-white);
          font: 600 13px/1 var(--tp-ff-roboto);
          color:var(--tp-text-1);
          cursor:pointer;
        }
        @media (max-width: 640px){
          .shopTopRight{
            display:grid;
            grid-template-columns:minmax(0,1fr) 132px;
            gap:10px;
          }
        }
      `}} />
    </section>
  );
};

export default ShopContent;
