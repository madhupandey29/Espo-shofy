'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams }             from 'next/navigation';

import ShopLoader                      from '../loader/shop/shop-loader';
import ErrorMsg                        from '../common/error-msg';
import ShopFilterOffCanvas             from '../common/shop-filter-offcanvas';
import ShopContent                     from './shop-content';
import ShopHiddenSidebarArea           from './shop-hidden-sidebar-area';



import {
  useGetAllNewProductsQuery,
  useGetPriceUptoQuery,
  useGetGsmUptoQuery,
  useGetOzUptoQuery,
  useGetQuantityUptoQuery,
  useGetPurchasePriceUptoQuery,
} from '@/redux/features/newProductApi';

const PROPERTY_MAP = Object.freeze({
  category: 'category',
  color:    'color',
  content:  'content',
  design:   'design',
  structure:'substructure',
  finish:   'subfinish',
  collectionId:'collectionId',
  vendor:   'vendor',
  suitablefor:'subsuitable',
  motifsize:'motif',
  substructure:'substructure',
  subfinish:'subfinish',
  subsuitable:'subsuitable',
});

export default function ShopArea({ shop_right = false, hidden_sidebar = false, initialProducts = [], totalProducts = 0, initialPagination = null }) {
  console.log('ShopArea Debug:', { 
    initialProductsLength: initialProducts.length, 
    totalProducts, 
    initialPagination 
  });

  // ────── URL params ─────────────────────────
  const p               = useSearchParams();
  const category        = p.get('category');
  const minPrice        = p.get('minPrice');
  const maxPrice        = p.get('maxPrice');
  const filterColor     = p.get('color');
  const filterStructure = p.get('structure');
  const filterContent   = p.get('content');
  const filterFinish    = p.get('finish');
  const gsm             = p.get('gsm');
  const oz              = p.get('oz');
  const quantity        = p.get('quantity');
  const purchasePrice   = p.get('purchasePrice');
  const searchQuery     = p.get('q') || p.get('searchText');

  // ────── State & handlers ────────────────────
  const [priceValue,      setPriceValue]      = useState([0, 1000]);
  const [selectValue,     setSelectValue]     = useState('');
  const [currPage,        setCurrPage]        = useState(1);
  const [currentApiPage,  setCurrentApiPage]  = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [allLoadedProducts, setAllLoadedProducts] = useState(initialProducts);
  const [hasMorePages, setHasMorePages] = useState(totalProducts > 50);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(!!searchQuery);

  const handleFilterChange = (obj) => {
    setCurrPage(1);
    setCurrentApiPage(1);
    setSelectedFilters(obj);
    setAllLoadedProducts(initialProducts); // Reset to initial products when filtering
  };
  
  const handleSlider = (val) => {
    setCurrPage(1);
    setCurrentApiPage(1);
    setPriceValue(val);
  };
  
  const handleSelect = (e) => {
    setSelectValue(e.value);
  };

  const loadMoreProducts = () => {
    setCurrentApiPage(prev => prev + 1);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchActive(!!results);
    setCurrPage(1);
    setCurrentApiPage(1);
  };

  // Perform search when searchQuery from URL changes
  useEffect(() => {
    const performSearch = async (query) => {
      if (!query || !query.trim() || query.trim().length < 2) {
        setSearchResults(null);
        setIsSearchActive(false);
        return;
      }

      try {
        const response = await fetch(`https://espobackend.vercel.app/api/product/search/${encodeURIComponent(query.trim())}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && Array.isArray(data.data)) {
            setSearchResults(data);
            setIsSearchActive(true);
            setCurrPage(1);
            setCurrentApiPage(1);
          } else {
            setSearchResults({ data: [], total: 0, success: false });
            setIsSearchActive(true);
          }
        } else {
          console.error('Search API error:', response.status);
          setSearchResults({ data: [], total: 0, success: false });
          setIsSearchActive(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ data: [], total: 0, success: false });
        setIsSearchActive(true);
      }
    };

    if (searchQuery && searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults(null);
      setIsSearchActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Remove any "Results for" text from page title or headings
  useEffect(() => {
    // Remove from document title if it contains "Results for"
    if (typeof document !== 'undefined') {
      const originalTitle = document.title;
      if (originalTitle.includes('Results for') || originalTitle.includes('results for')) {
        document.title = 'Shop - Browse Products';
      }
    }
    
    // Remove any headings with "Results for" text
    if (typeof document !== 'undefined') {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const text = heading.textContent || heading.innerText;
        if (text.includes('Results for') || text.includes('results for') || text.match(/Nokia-\d+\s+Results\s+for/i)) {
          heading.style.display = 'none';
        }
      });
    }
  }, [searchQuery, searchResults]);

  const otherProps = {
    priceFilterValues: { priceValue, handleChanges: handleSlider, setPriceValue },
    selectHandleFilter: handleSelect,
    currPage, setCurrPage,
    currentApiPage, setCurrentApiPage,
    selectedFilters, handleFilterChange,
    loadMoreProducts,
    hasMorePages,
    totalProducts: isSearchActive ? (searchResults?.total || 0) : totalProducts,
    isSearchActive,
    searchResults,
    handleSearchResults,
  };

  // ────── Data fetching ───────────────────────
  const gsmQ           = useGetGsmUptoQuery(gsm,          { skip: !gsm });
  const ozQ            = useGetOzUptoQuery(oz,            { skip: !oz });
  const quantityQ      = useGetQuantityUptoQuery(quantity, { skip: !quantity });
  const purchasePriceQ = useGetPurchasePriceUptoQuery(purchasePrice, { skip: !purchasePrice });
  const priceQ         = useGetPriceUptoQuery(minPrice, {
                          skip: !(minPrice && maxPrice && minPrice === maxPrice),
                        });
  const allQ           = useGetAllNewProductsQuery({ limit: 50, page: currentApiPage }, {
                          skip: gsm || oz || quantity || purchasePrice ||
                                (minPrice && maxPrice && minPrice === maxPrice) ||
                                currentApiPage === 1 || // Skip if it's page 1 (we have initial data)
                                isSearchActive, // Skip API calls when search is active
                        });

  const { data: productsData, isLoading, isError } =
    gsm            ? gsmQ :
    oz             ? ozQ  :
    quantity       ? quantityQ :
    purchasePrice  ? purchasePriceQ :
    (minPrice && maxPrice && minPrice === maxPrice) ? priceQ :
    allQ;

  // memoize so we don’t rebuild [] on every render
  const products = useMemo(() => {
    // Use search results if search is active
    if (isSearchActive && searchResults) {
      return searchResults.data || [];
    }
    
    // Use API data if available, otherwise fall back to initialProducts
    if (productsData?.data && Array.isArray(productsData.data)) {
      return productsData.data;
    }
    // Fall back to initialProducts from server-side rendering
    return Array.isArray(initialProducts) ? initialProducts : [];
  }, [productsData?.data, initialProducts, isSearchActive, searchResults]);

  // Handle loading more products
  useEffect(() => {
    if (productsData?.data && currentApiPage > 1) {
      setAllLoadedProducts(prev => [...prev, ...productsData.data]);
      
      // Check if there are more pages
      const totalPages = productsData?.pagination?.totalPages || Math.ceil(totalProducts / 50);
      setHasMorePages(currentApiPage < totalPages);
    }
  }, [productsData, currentApiPage, totalProducts]);

  // auto-expand price slider max
  useEffect(() => {
    if (!isLoading && !isError && products.length) {
      const max = products.reduce((m, pr) => Math.max(m, +pr.salesPrice||0), 0);
      if (max > priceValue[1]) setPriceValue(([lo]) => [lo, max]);
    }
  }, [isLoading, isError, products, priceValue]);

  // ────── Filtering & sorting ─────────────────
  const filteredProducts = useMemo(() => {
    if (isLoading || isError) return [];

    let items = products;

    // 1) checkbox‐sidebar filters
    const active = Object.entries(selectedFilters).filter(([, arr]) => arr.length);
    if (active.length) {
      items = items.filter(pr =>
        active.every(([key, vals]) => {
          const prop = PROPERTY_MAP[key];
          if (!prop || !pr[prop]) return false;
          const field = pr[prop];
          if (Array.isArray(field)) {
            return field.some(x => vals.includes(x._id ?? x));
          }
          return vals.includes(field._id ?? field);
        })
      );
    }

    // 2) sort
    if (selectValue === 'Low to High')  items = [...items].sort((a,b)=>a.salesPrice-b.salesPrice);
    if (selectValue === 'High to Low')  items = [...items].sort((a,b)=>b.salesPrice-a.salesPrice);
    if (selectValue === 'New Added')    items = [...items].sort((a,b)=>new Date(b.published_at)-new Date(a.published_at));

    // 3) URL‐string filters
    const slugify = s => s?.toLowerCase().replace(/&/g,'').split(' ').join('-');
    if (category)        items = items.filter(p=>slugify(p.category?.name)===category);
    if (filterColor)     items = items.filter(p=>p.color?.some(c=>slugify(c.name)===filterColor));
    if (filterStructure) items = items.filter(p=>slugify(p.substructure?.name)===filterStructure);
    if (filterContent)   items = items.filter(p=>slugify(p.content?.name)===filterContent);
    if (filterFinish)    items = items.filter(p=>slugify(p.subfinish?.name)===filterFinish);

    if (minPrice && maxPrice) {
      items = items.filter(p => +p.salesPrice >= +minPrice && +p.salesPrice <= +maxPrice);
    }

    return items;
  }, [
    isLoading, isError, products,
    selectedFilters, selectValue,
    category, filterColor, filterStructure, filterContent, filterFinish,
    minPrice, maxPrice,
  ]);

  // ────── Choose which main component to show ───
  let content;
  if (isLoading)           content = <ShopLoader loading />;
  else if (isError)        content = (
    <div className="shop-error-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div className="shop-error-content">
        <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>Products Temporarily Unavailable</h3>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          We're experiencing technical difficulties loading products. This appears to be a backend database issue.
        </p>
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
            <strong>Technical Details:</strong> The API is returning a database error related to Category ObjectId casting. 
            Please contact the backend team to fix the Category model data.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

else if (hidden_sidebar) {
  content = (
    <ShopHiddenSidebarArea
      all_products={products}
      products={filteredProducts}
      otherProps={otherProps}
    />
  );
} else {
  content = (
    <ShopContent
      all_products={products}
      products={filteredProducts}
      otherProps={otherProps}
      shop_right={shop_right}
      hidden_sidebar={hidden_sidebar}
    />
  );
}

  return (
    <>
      {content}

      {/* off-canvas filter */}
      {!isLoading && !isError && (
        <ShopFilterOffCanvas
          all_products={products}
          otherProps={otherProps}
          right_side={shop_right}
        />
      )}
    </>
  );
}
