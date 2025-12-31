/* eslint-disable no-unused-vars */
'use client';
import React, { useState, useEffect } from 'react';
// Pagination removed for Load More behavior
import ProductItem      from '../products/fashion/product-item';
import ShopTopLeft      from './shop-top-left';
import ShopTopRight     from './shop-top-right';

const ShopHiddenSidebarArea = ({
  all_products = [],
  products     = [],
  otherProps,
}) => {
  const { selectHandleFilter, currPage, setCurrPage } = otherProps;
  const [filteredRows, setFilteredRows] = useState(products);
  const [visibleCount, setVisibleCount] = useState(40);

  // sync when products change
  useEffect(() => {
    setFilteredRows(products);
    setVisibleCount(Math.min(40, products.length || 0));
    setCurrPage(1);
  }, [products, setCurrPage]);

  // no pagination; using incremental visibility via Load More

  return (
    <section className="tp-shop-area pb-120">
      <div className="container">
        <div className="tp-shop-main-wrapper">
          <div className="tp-shop-top mb-45">
            <div className="row">
              <div className="col-xl-6">
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

          {filteredRows.length === 0 ? (
            <h2 className="text-center">No products found</h2>
          ) : (
            <div className="tp-shop-items-wrapper tp-shop-item-primary">
              {/* ✅ Only one (grid) slider now */}
              <div className="row">
                {filteredRows.slice(0, visibleCount).map((item) => (
                  <div key={item._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                    <ProductItem product={item} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleCount < filteredRows.length && (
            <div className="tp-shop-pagination mt-20 d-flex justify-content-center">
              <button
                type="button"
                className="load-more-btn"
                onClick={() => setVisibleCount(filteredRows.length)}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hide any List-view toggle button that may still render in the toolbar */}
      <style jsx>{`
        [data-bs-target="#list-tab-pane"],
        #list-tab { display: none !important; }
        .load-more-btn {
          background: #000;
          color: #fff;
          border: 1px solid #000;
          padding: 12px 28px;
          border-radius: 9999px;
          font-weight: 600;
          transition: all .2s ease;
        }
        .load-more-btn:hover { background: #fff; color: #000; }
      `}</style>
    </section>
  );
};

export default ShopHiddenSidebarArea;
