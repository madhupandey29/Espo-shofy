'use client';

import React from "react";
import { useDispatch } from "react-redux";
import { Filter } from "@/svg";
import { handleFilterSidebarOpen } from "@/redux/features/shop-filter-slice";

const ShopTopRight = () => {
  const dispatch = useDispatch();

  return (
    <div
      className="tp-shop-top-right shop-toolbar mb-20"
      role="region"
      aria-label="Search and filter toolbar"
    >
      {/* Search (same markup/classes as header) */}
      <div className="shop-toolbar__search">
       {/*  <HeaderSearchForm /> */}
      </div>

      {/* Filter - Hidden on desktop, visible on mobile */}
      <div className="shop-toolbar__filter d-lg-none">
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
  );
};

export default ShopTopRight;
