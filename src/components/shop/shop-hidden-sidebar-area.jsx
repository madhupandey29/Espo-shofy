/* eslint-disable no-unused-vars */
'use client';
import React, { useState, useEffect } from 'react';
// Pagination removed for Load More behavior
import ProductItem      from '../products/fashion/product-item';
import ShopTopLeft      from './shop-top-left';

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
                <div className="shopTopRight" role="region" aria-label="Sort toolbar">
                  {/* Sort */}
                  <div className="shopSort d-none d-lg-block">
                    <select onChange={selectHandleFilter} aria-label="Sort products">
                      <option value="default">Sort: Recommended</option>
                      <option value="new">What's New</option>
                      <option value="priceLow">Price: Low to High</option>
                      <option value="priceHigh">Price: High to Low</option>
                      <option value="nameAsc">Name: A to Z</option>
                    </select>
                  </div>

                  <style dangerouslySetInnerHTML={{__html: `
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
                  `}} />
                </div>
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
