'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from '@/svg';
import { handleFilterSidebarOpen } from '@/redux/features/shop-filter-slice';

const ShopTopRight = ({ selectHandleFilter, onSearchResults }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize search value from URL params
  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('searchText') || '';
    setSearchValue(query);
    // Only perform search if there's a query and it's different from current search
    if (query.trim() && query.length >= 2 && query !== searchValue) {
      performSearch(query);
    }
  }, [searchParams]); // Removed performSearch from dependencies to prevent infinite loops

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      onSearchResults?.(null);
      return;
    }

    setIsSearching(true);
    setIsTyping(false);
    try {
      const response = await fetch(`https://espobackend.vercel.app/api/product/search/${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          onSearchResults?.(data);
          
          // Update URL with search query
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('q', query);
          router.push(newUrl.pathname + newUrl.search, { scroll: false });
        } else {
          onSearchResults?.({ data: [], total: 0, success: false });
        }
      } else {
        console.error('Search API error:', response.status);
        onSearchResults?.({ data: [], total: 0, success: false });
      }
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults?.({ data: [], total: 0, success: false });
    } finally {
      setIsSearching(false);
    }
  }, [onSearchResults, router]);

  // Debounce search - increased delay and better logic
  useEffect(() => {
    if (searchValue.trim() && searchValue.length >= 2) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }

    const timeoutId = setTimeout(() => {
      if (searchValue.trim() && searchValue.length >= 2) {
        performSearch(searchValue);
      } else if (searchValue === '') {
        // Only clear when search is completely empty
        onSearchResults?.(null);
        setIsTyping(false);
        // Remove search param from URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('q');
        newUrl.searchParams.delete('searchText');
        router.push(newUrl.pathname + newUrl.search, { scroll: false });
      }
    }, 1200); // Increased delay to 1.2 seconds like YouTube

    return () => clearTimeout(timeoutId);
  }, [searchValue]); // Removed other dependencies to prevent infinite loops

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (value.trim() && value.length >= 2) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchValue.trim() && searchValue.length >= 2) {
      e.preventDefault();
      performSearch(searchValue);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setIsTyping(false);
    setIsSearching(false);
    onSearchResults?.(null);
    
    // Remove search param from URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('q');
    newUrl.searchParams.delete('searchText');
    router.push(newUrl.pathname + newUrl.search, { scroll: false });
  };

  return (
    <div className="shopTopRight" role="region" aria-label="Search and sort toolbar">
      {/* Search */}
      <div className="shopSearch">
        <input
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search fabrics, codes, categories..."
          aria-label="Search products"
          disabled={isSearching}
        />
        {searchValue && (
          <button
            type="button"
            className="clearSearchBtn"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <span className="searchIcon" aria-hidden="true">
          {isSearching ? '⟳' : isTyping ? '⌨' : '⌕'}
        </span>
      </div>

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

      <style jsx>{`
        .shopTopRight{
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:12px;
        }

        .shopSearch{
          position:relative;
          width:min(420px, 100%);
          flex:1 1 auto;
        }
        .shopSearch input{
          width:100%;
          height:44px;
          padding:0 ${searchValue ? '70px' : '40px'} 0 14px;
          border:1px solid var(--tp-grey-2);
          border-radius:10px;
          font: 500 14px/1 var(--tp-ff-roboto);
          color:var(--tp-text-1);
          background:var(--tp-common-white);
          outline:none;
          transition: all 0.3s ease;
        }
        .shopSearch input:focus{
          border-color: var(--tp-theme-primary);
          box-shadow: 0 0 0 3px rgba(44, 76, 151, 0.12);
        }
        .shopSearch input:disabled{
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .clearSearchBtn{
          position:absolute;
          right:40px;
          top:50%;
          transform:translateY(-50%);
          width:20px;
          height:20px;
          border:none;
          background:var(--tp-grey-2);
          color:var(--tp-common-white);
          border-radius:50%;
          font-size:14px;
          line-height:1;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          transition: all 0.3s ease;
        }
        .clearSearchBtn:hover{
          background:var(--tp-theme-primary);
        }
        
        .searchIcon{
          position:absolute;
          right:12px;
          top:50%;
          transform:translateY(-50%);
          font-size:18px;
          color:var(--tp-text-2);
          pointer-events:none;
          animation: ${isSearching ? 'spin 1s linear infinite' : 'none'};
          transition: color 0.3s ease;
        }
        
        .shopSearch input:focus + .searchIcon,
        .shopSearch input:not(:placeholder-shown) + .searchIcon {
          color: var(--tp-theme-primary);
        }

        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
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
          .shopSearch{ width:100%; }
        }
      `}</style>
    </div>
  );
};

export default ShopTopRight;
