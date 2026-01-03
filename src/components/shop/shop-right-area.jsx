import React, { useMemo, useState } from "react";
import Pagination from "@/ui/Pagination";
import ProductItem from "../products/fashion/product-item";
import ShopListItem from "./shop-list-item";
import ShopTopLeft from "./shop-top-left";
import ShopTopRight from "./shop-top-right";
import ResetButton from "./shop-filter/reset-button";
import EnhancedShopSidebarFilters from "./EnhancedShopSidebarFilters";

// --- helpers ---------------------------------------------------------------
const toArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const titleize = (k) =>
  k === "substructure" ? "Sub-structure" :
  k === "subfinish"    ? "Sub-finish"    :
  k === "subsuitable"  ? "Sub-suitable"  :
  k === "motifsize"    ? "Motif Size"    :
  k === "collectionId" ? "Collection"    :
  k.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

// --------------------------------------------------------------------------

const ShopRightArea = ({ all_products, products, otherProps, right_side }) => {
  const {
    selectHandleFilter,
    currPage, setCurrPage,
    priceFilterValues,
    selectedFilters = {},
    handleFilterChange,
  } = otherProps;

  const [filteredRows, setFilteredRows] = useState(products);
  const [pageStart, setPageStart] = useState(0);
  const [countOfPage, setCountOfPage] = useState(12);

  const paginatedData = (items, startPage, pageCount) => {
    setFilteredRows(items);
    setPageStart(startPage);
    setCountOfPage(pageCount);
  };

  // keys except the special cache bucket
  const facetEntries = Object.entries(selectedFilters).filter(
    ([k]) => k !== "__labels"
  );

  // ---- active filters
  const maxPrice = all_products.reduce(
    (m, p) => Math.max(m, +p.salesPrice || +p.price || 0),
    1000
  );
  const pv = priceFilterValues?.priceValue ?? priceFilterValues?.value ?? [0, maxPrice];
  const priceActive = Array.isArray(pv) && (pv[0] > 0 || pv[1] < maxPrice);
  const facetsActive = facetEntries.some(([, v]) => toArr(v).length > 0);
  const anyActive = !!(priceActive || facetsActive);

  // ---- chips (simplified without complex mapping)
  const chips = [];
  if (priceActive) chips.push({ key: "__price__", label: `Price: ${pv[0]}–${pv[1]}` });

  facetEntries.forEach(([key, raw]) => {
    toArr(raw).forEach((v) => {
      if (v == null || v === "") return;
      chips.push({
        key,
        value: String(v),
        label: `${titleize(key)}: ${v}` // Use the value directly since we don't have complex mapping
      });
    });
  });

  const clearAll = () => {
    priceFilterValues?.setPriceValue?.([0, maxPrice]);
    // also clear label cache
    handleFilterChange?.({});
  };

  const removeOne = (key, val) => {
    if (key === "__price__") {
      priceFilterValues?.setPriceValue?.([0, maxPrice]);
      return;
    }
    const next = { ...(selectedFilters || {}) };

    // Remove the value from the array
    const arr = toArr(next[key]).filter((x) => String(x) !== String(val));
    if (arr.length) next[key] = arr;
    else delete next[key];

    handleFilterChange?.(next);
  };

  // ---- UI -----------------------------------------------------------------
  return (
    <section className="tp-shop-area pb-120">
      <div className="container">
        <div className="row">
          {/* main */}
          <div className="col-xl-9 col-lg-8">
            <div className="tp-shop-main-wrapper">
              <div className="shop-toolbar-sticky">
                <div className="tp-shop-top mb-45">
                  <div className="row">
                    <div className="col-xl-6">
                      <ShopTopLeft
                        showing={
                          products.length === 0
                            ? 0
                            : filteredRows.slice(pageStart, pageStart + countOfPage).length
                        }
                        total={all_products.length}
                      />
                    </div>
                    <div className="col-xl-6">
                      <ShopTopRight selectHandleFilter={selectHandleFilter} />
                    </div>
                  </div>
                </div>
              </div>

              {products.length === 0 && <h2>No products found</h2>}

              {products.length > 0 && (
                <div className="tp-shop-items-wrapper tp-shop-item-primary">
                  <div className="tab-content" id="productTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="grid-tab-pane"
                      role="tabpanel"
                      aria-labelledby="grid-tab"
                      tabIndex={0}
                    >
                      <div className="row g-4">
                        {filteredRows
                          .slice(pageStart, pageStart + countOfPage)
                          .map((item) => (
                            <div key={item._id} className="col-xl-4 col-md-6 col-sm-6">
                              <ProductItem product={item} />
                            </div>
                          ))}
                      </div>
                    </div>

                    <div
                      className="tab-pane fade"
                      id="list-tab-pane"
                      role="tabpanel"
                      aria-labelledby="list-tab"
                      tabIndex={0}
                    >
                      <div className="tp-shop-list-wrapper tp-shop-item-primary mb-70">
                        <div className="row">
                          <div className="col-xl-12">
                            {filteredRows
                              .slice(pageStart, pageStart + countOfPage)
                              .map((item) => (
                                <ShopListItem key={item._id} product={item} />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div className="tp-shop-pagination mt-20">
                  <div className="tp-pagination">
                    <Pagination
                      items={products}
                      countOfPage={12}
                      paginatedData={paginatedData}
                      currPage={currPage}
                      setCurrPage={setCurrPage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* right sidebar */}
          <div className="col-xl-3 col-lg-4">
            <div className="tp-shop-sidebar mr-10 sticky-filter">
              <div className="filter-header d-flex align-items-center justify-content-between">
                <h3 className="tp-shop-widget-title mb-0">Filters</h3>
                <ResetButton
                  className="filter-reset-btn"
                  active={anyActive}
                  setPriceValues={priceFilterValues?.setPriceValue}
                  maxPrice={maxPrice}
                  handleFilterChange={handleFilterChange}
                  shop_right={right_side}
                  aria-label="Reset all filters"
                />
              </div>

              {/* Applied chips */}
              {chips.length > 0 && (
                <div className="applied-filters">
                  <button
                    type="button"
                    className="applied-filters__clear"
                    onClick={clearAll}
                  >
                    CLEAR ALL
                  </button>
                  <div className="applied-filters__chips">
                    {chips.map((c, i) => (
                      <button
                        key={`${c.key}-${c.value ?? "all"}-${i}`}
                        type="button"
                        className="chip"
                        onClick={() => removeOne(c.key, c.value)}
                        title="Remove"
                      >
                        <span className="chip__x">×</span>
                        <span className="chip__text">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced filter blocks using new API */}
              <EnhancedShopSidebarFilters
                selected={selectedFilters}
                onFilterChange={handleFilterChange}
              />

              {/* Legacy filter blocks - can be removed once fully migrated */}
              {/* <PriceFilter priceFilterValues={priceFilterValues} maxPrice={maxPrice} /> */}
              {/* <StatusFilter setCurrPage={setCurrPage} shop_right={right_side} /> */}
              {/* <CategoryFilter setCurrPage={setCurrPage} shop_right={right_side} />
              <ColorFilter setCurrPage={setCurrPage} shop_right={right_side} />
              <StructureFilter setCurrPage={setCurrPage} shop_right={right_side} /> */}
            </div>
          </div>
        </div>
      </div>

      {/* styles for chips */}
      <style jsx>{`
        .applied-filters {
          position: sticky;
          top: 44px;
          z-index: 1;
          background: #fff;
          padding: 10px 0 12px;
          border-bottom: 1px solid rgba(0,0,0,.06);
          margin-bottom: 8px;
        }
        .applied-filters__clear {
          float: right;
          font-weight: 700;
          font-size: 12px;
          color: #2563eb;
          background: transparent;
          border: 0;
          padding: 0;
        }
        .applied-filters__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 6px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #efefef;
          border: 0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #111827;
          cursor: pointer;
          transition: background .2s ease;
        }
        .chip:hover { background: #e8e8e8; }
        .chip__x { font-weight: 700; }
      `}</style>
    </section>
  );
};

export default ShopRightArea;
