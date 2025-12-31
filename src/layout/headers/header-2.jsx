'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import useSticky from '@/hooks/use-sticky';
import useCartInfo from '@/hooks/use-cart-info'; // keep if you still need other info it provides
import Image from 'next/image';

import {
  openCartMini,
  selectCartDistinctCount,
  fetch_cart_products,
} from '@/redux/features/cartSlice';
import CartMiniSidebar from '@/components/common/cart-mini-sidebar';
import OffCanvas from '@/components/common/off-canvas';
import Menus from './header-com/menus';
import { CartTwo, Search } from '@/svg';
import { FaHeart, FaUser } from 'react-icons/fa';
import { useGetSessionInfoQuery } from '@/redux/features/auth/authApi';
import { FiMenu } from 'react-icons/fi';
import useGlobalSearch from '@/hooks/useGlobalSearch';

/* =========================
   Small helpers
========================= */
const PAGE_SIZE = 20;
const MAX_LIMIT = 200;
const nonEmpty = (v) => v !== undefined && v !== null && String(v).trim() !== '';

/** Try to read userId from Redux first, then fallback to localStorage */
const selectUserIdFromStore = (state) =>
  state?.auth?.user?._id ||
  state?.auth?.user?.id ||
  state?.auth?.userInfo?._id ||
  state?.auth?.userInfo?.id ||
  state?.user?.user?._id ||
  null;

/** Normalizer for search results */
function normalizeProduct(p) {
  const id = p._id || p.id || p.slug || String(Math.random());
  const slug = p.slug || p.seoSlug || p.handle || '';
  const name = p.name || p.title || p.productname || p.productName || 'Untitled';
  const img =
    p.image || p.img || p.thumbnail || p.images?.[0] || p.mainImage || p.picture ||
    '/assets/img/product/default-product-img.jpg';
  const price = p.price || p.mrp || p.minPrice || null;
  return { id, slug, name, img, price };
}

/** Multi-endpoint product search helper */
async function searchProducts(q, limit = PAGE_SIZE, signal) {
  const b = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
  const queries = [
    `${b}/product/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    `${b}/product?q=${encodeURIComponent(q)}&limit=${limit}`,
    `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  ];
  for (const url of queries) {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) continue;
      const data = await res.json();
      const arr =
        Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
            : Array.isArray(data?.results) ? data.results
              : Array.isArray(data?.items) ? data.items
                : [];
      return arr.map(normalizeProduct);
    } catch(err) {
        console.log("Error in searchProducts:", err);
    }
  }
  return [];
}

/** === NEW: dedicated fetcher for profile image by userId === */
const SHOPY_API_BASE = 'https://test.amrita-fashions.com/shopy';
async function fetchUserAvatarById(userId, signal) {
  if (!userId) return null;
  try {
    const res = await fetch(`${SHOPY_API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      credentials: 'include', // safe to keep; server may ignore
      signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    // server example shape:
    // { success: true, user: { userImage: "https://..." } }
    const url =
      json?.user?.userImage ||
      json?.userImage ||
      json?.data?.user?.userImage ||
      null;
    return typeof url === 'string' && url.trim() ? url.trim() : null;
  } catch {
    return null;
  }
}

const HeaderTwo = ({ style_2 = false }) => {
  const dispatch = useDispatch();
  const { sticky } = useSticky();
  const router = useRouter();

  // ===== user / wishlist =====
  const reduxUserId = useSelector(selectUserIdFromStore);
  const [fallbackUserId, setFallbackUserId] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = window.localStorage.getItem('userId');
      if (uid) setFallbackUserId(uid);
    }
  }, []);
  const userId = reduxUserId || fallbackUserId || null;

  const { wishlist } = useSelector((s) => s.wishlist || { wishlist: [] });
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  // ===== cart count (server-derived) =====
  const { quantity: cartCount } = useCartInfo();
  const distinctCount = cartCount ?? 0;
  
  // Debug: Log cart count in header
  if (process.env.NODE_ENV === 'development') {
    console.log('Header-2 Cart Count Debug:', {
      cartCount,
      distinctCount,
      userId
    });
  }

  // Initial cart fetch when we have a userId
  useEffect(() => {
    if (userId) {
      dispatch(fetch_cart_products({ userId }));
    }
  }, [dispatch, userId]);

  const [isOffCanvasOpen, setIsCanvasOpen] = useState(false);

  // ===== GLOBAL SEARCH =====
  const { query, setQuery, debounced } = useGlobalSearch(150);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState([]);
  const [selIndex, setSelIndex] = useState(-1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const searchWrapRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => { setLimit(PAGE_SIZE); }, [debounced]);

  useEffect(() => {
    const controller = new AbortController();
    const q = (debounced || '').trim();
    if (q.length < 2) {
      setResults([]); setSelIndex(-1); setLoading(false); setLoadingMore(false);
      return;
    }
    setLoading(true);
    setSearchOpen(true);
    searchProducts(q, Math.min(limit, MAX_LIMIT), controller.signal)
      .then((arr) => { setResults(arr); setSelIndex(arr.length ? 0 : -1); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debounced, limit]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onScroll = () => {
      if (loading || loadingMore) return;
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
      if (nearBottom && limit < MAX_LIMIT) {
        setLoadingMore(true);
        setLimit((l) => Math.min(l + PAGE_SIZE, MAX_LIMIT));
        setTimeout(() => setLoadingMore(false), 120);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [limit, loading, loadingMore]);

  useEffect(() => {
    const onDoc = (e) => {
      const w = searchWrapRef.current;
      if (!w) return;
      if (!(e.target instanceof Node)) return;
      if (!w.contains(e.target)) setSearchOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    document.addEventListener('mousedown', onDoc, true);
    document.addEventListener('touchstart', onDoc, true);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc, true);
      document.removeEventListener('touchstart', onDoc, true);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    setQuery(''); setResults([]); setSelIndex(-1); setSearchOpen(false); setLimit(PAGE_SIZE);
  }, [pathname, setQuery]);

  const resetSearchUI = () => {
    setQuery(''); setResults([]); setSelIndex(-1); setSearchOpen(false); setLimit(PAGE_SIZE);
  };
  const go = (href) => {
    resetSearchUI();
    try { window.scrollTo?.(0, 0); } catch(err) { console.log("err:",err) ;}
    router.push(href);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = (query || '').trim();

    if (selIndex >= 0 && results[selIndex]) {
      const p = results[selIndex];
      const href = p.slug ? `/product-details/${p.slug}` : `/product-details?id=${encodeURIComponent(p.id)}`;
      go(href);
      return;
    }
    if (q.length) {
      go(`/search?searchText=${encodeURIComponent(q)}`);
    } else {
      setSearchOpen(true);
    }
  };

  // ✅ Keyboard handler exists
  const onSearchKeyDown = (e) => {
    if (!searchOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelIndex((i) => Math.min((results.length || 0) - 1, (i < 0 ? 0 : i + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelIndex((i) => Math.max(-1, i - 1));
    }
    // Enter handled by form submit
  };

  // ===== Session & user dropdown =====
  const [hasSession, setHasSession] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  // Prefer fetching full session if available (may include avatar)
  const { data: userData } = useGetSessionInfoQuery(
    { userId },
    { skip: !userId, refetchOnMountOrArgChange: true }
  );

  // Update image from session payload if present
  useEffect(() => {
    if (userData?.user?.userImage) {
      setUserImage(userData.user.userImage);
    } else if (userData?.user?.avatar) {
      setUserImage(userData.user.avatar);
    }
  }, [userData]);

  // === NEW: If userId exists but session didn't give avatar, fetch it from /shopy/users/{userId}
  useEffect(() => {
    if (!userId) return;
    // If we already have an image from session, keep it; else fetch
    if (userImage && typeof userImage === 'string' && userImage.trim()) return;

    const controller = new AbortController();
    fetchUserAvatarById(userId, controller.signal).then((url) => {
      if (url) setUserImage(url);
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Consider a user "has session" if either a server session or a userId exists
  useEffect(() => {
    const check = () => {
      const lsHasSessionId = typeof window !== 'undefined' && !!window.localStorage.getItem('sessionId');
      const lsHasUserId = typeof window !== 'undefined' && !!window.localStorage.getItem('userId');
      setHasSession(lsHasSessionId || lsHasUserId);
    };
    check();
    const onStorage = (e) => {
      if (e.key === 'sessionId' || e.key === 'userId') check();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const close = () => setUserOpen(false);
    const onPointer = (e) => {
      const btn = userBtnRef.current, menu = userMenuRef.current, t = e.target;
      if (!t) return;
      if (btn?.contains(t) || menu?.contains(t)) return;
      close();
    };
    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    const onScroll = () => close();
    const onResize = () => close();
    const onVisibility = () => { if (document.visibilityState === 'hidden') close(); };
    if (userOpen) {
      document.addEventListener('mousedown', onPointer, true);
      document.addEventListener('touchstart', onPointer, true);
      document.addEventListener('keydown', onEsc);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      document.removeEventListener('mousedown', onPointer, true);
      document.removeEventListener('touchstart', onPointer, true);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [userOpen]);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        try {
          import('js-cookie')
            .then((Cookies) => Cookies.default.remove('userInfo'))
            .catch((err) => console.error('Failed to remove userInfo cookie:', err));
        } catch (err) {
          console.error('Error importing js-cookie:', err);
        }
      }
    } finally {
      setHasSession(false);
      setUserOpen(false);
      if (typeof window !== 'undefined') router.push('/');
    }
  };

  /** When user clicks the cart icon:
   *  Navigate directly to cart page instead of opening mini sidebar
   */
  const onOpenCart = () => {
    router.push('/cart');
  };

  const currentUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/';
    const url = new URL(window.location.href);
    return url.pathname + url.search;
  }, []);

  // Prefetch common routes for faster nav
  useEffect(() => {
    try {
      ['/shop','/wishlist','/cart','/profile','/login','/register']
        .forEach((p) => router.prefetch?.(p));
    } catch {}
  }, [router]);

  return (
    <>
      <header>
        <div className={`tp-header-area tp-header-style-${style_2 ? 'primary' : 'darkRed'} tp-header-height`} style={{ overflow: 'visible' }}>
          <div
            id="header-sticky"
            className={`tp-header-bottom-2 tp-header-sticky ${sticky ? 'header-sticky' : ''}`}
            style={{ position: 'relative', overflow: 'visible' }}
          >
            <div className="container" style={{ overflow: 'visible' }}>
              <div className="tp-mega-menu-wrapper p-relative" style={{ overflow: 'visible' }}>
                <div className="row align-items-center">
                  {/* Logo */}
                  <div className="col-6 col-sm-4 col-md-4 col-lg-3 col-xl-2">
                    <div className="logo d-flex align-items-center" style={{ gap: '12px' }}>
                      <Link href="/" className="d-flex align-items-center" style={{ gap: '12px' }}>
                        <img
                          src="/assets/img/logo/age.jpg"
                          alt="Company Logo"
                          width={140}
                          height={44}
                          style={{ height: 'auto', width: 'auto', maxWidth: '140px', maxHeight: '44px' }}
                          sizes="(max-width: 600px) 110px, 140px"
                        />
                      </Link>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="d-none d-xl-block col-xl-5">
                    <div className="main-menu menu-style-2">
                      <nav className="tp-main-menu-content"><Menus /></nav>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="col-6 col-sm-8 col-md-8 col-lg-9 col-xl-5">
                    <div className="tp-header-bottom-right d-flex align-items-center justify-content-end">

                      {/* ======= SEARCH ======= */}
                      <div className="tp-header-search-2 d-none d-sm-block me-3 search-spacer" ref={searchWrapRef}>
                        <form onSubmit={onSearchSubmit}>
                          <input
                            value={query}
                            onChange={(e) => {
                              const v = e.target.value;
                              setQuery(v);
                              if (v && !searchOpen) setSearchOpen(true);
                            }}
                            onKeyDown={onSearchKeyDown}
                            type="text"
                            placeholder="Search for Products..."
                            aria-label="Search products"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            inputMode="search"
                            onFocus={() => { if (nonEmpty(query)) setSearchOpen(true); }}
                          />
                          <button type="submit" aria-label="Search"><Search /></button>
                        </form>

                        {/* dropdown results */}
                        {searchOpen && (query || '').trim().length >= 2 && (
                          <div
                            ref={dropRef}
                            className="search-dropdown"
                            role="listbox"
                            aria-label="Search results"
                          >
                            {loading && <div className="search-item muted">Searching…</div>}
                            {!loading && results.length === 0 && (
                              <div className="search-item muted">No results</div>
                            )}
                            {results.map((p, i) => {
                              const href = p.slug ? `/product-details/${p.slug}` : `/product-details?id=${encodeURIComponent(p.id)}`;
                              const active = i === selIndex;
                              return (
                                <button
                                  key={`${p.id}-${i}`}
                                  type="button"
                                  className={`search-item ${active ? 'active' : ''}`}
                                  onMouseEnter={() => { setSelIndex(i); try { router.prefetch?.(href); } catch {} }}
                                  onClick={() => {
                                    setSelIndex(i);
                                    go(href);
                                  }}
                                >
                                  <span className="search-name">{p.name}</span>
                                  {p.price != null && <span className="search-price">₹{String(p.price)}</span>}
                                </button>
                              );
                            })}
                            {loadingMore && <div className="search-item muted">Loading more…</div>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="tp-header-action d-flex align-items-center">
                        {/* User / Auth */}
                        <div className="tp-header-action-item me-2 position-relative" style={{ overflow: 'visible' }}>
                          {hasSession ? (
                            <>
                              <button
                                ref={userBtnRef}
                                onClick={() => setUserOpen((v) => !v)}
                                className="tp-header-action-btn"
                                aria-haspopup="menu"
                                aria-expanded={userOpen}
                                aria-label="Account menu"
                                type="button"
                                style={userImage ? { padding: 0, overflow: 'hidden', borderRadius: '50%' } : {}}
                              >
                                {/* === Show avatar if available; else fallback icon === */}
                                {userImage ? (
                                  <>
                                    <img
                                      src={userImage}
                                      alt="Profile"
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        border: '1px solid rgba(0,0,0,0.1)'
                                      }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        // show icon if image fails
                                        const sib = e.currentTarget.nextElementSibling;
                                        if (sib && sib.style) sib.style.display = 'inline-flex';

                                      }}
                                    />
                                    <FaUser style={{ display: 'none' }} />
                                  </>
                                ) : (
                                  <FaUser />
                                )}
                              </button>

                              {userOpen && (
                                <div ref={userMenuRef} role="menu" className="user-menu-dropdown">
                                  <div className="user-menu-inner">
                                    <button
                                      className="user-item"
                                      type="button"
                                      role="menuitem"
                                      onClick={() => { setUserOpen(false); go('/profile'); }}
                                    >
                                      My Profile
                                    </button>
                                    <div className="user-divider" />
                                    <button className="user-item danger" type="button" role="menuitem" onClick={handleLogout}>
                                      Logout
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              href={`/login?redirect=${encodeURIComponent(currentUrl)}`}
                              className="tp-auth-cta"
                              aria-label="Login or Sign Up"
                              prefetch
                              onMouseEnter={() => { try { router.prefetch?.('/login'); } catch {} }}
                            >
                              <span className="tp-auth-cta-text">
                                <FaUser className="tp-auth-cta-icon" />
                                <span>Login&nbsp;/&nbsp;SignUp</span>
                              </span>
                            </Link>
                          )}
                        </div>

                        {/* Wishlist */}
                        <div className="tp-header-action-item d-none d-lg-block me-2">
                          <Link href="/wishlist" className="tp-header-action-btn" aria-label="Wishlist" prefetch onMouseEnter={() => { try { router.prefetch?.('/wishlist'); } catch {} }}>
                            <FaHeart /><span className="tp-header-action-badge">{wishlistCount}</span>
                          </Link>
                        </div>

                        {/* Cart — (show only when logged in / user present) */}
                        {hasSession && (
                          <div className="tp-header-action-item me-2">
                            <button
                              onClick={onOpenCart}
                              className="tp-header-action-btn cartmini-open-btn"
                              aria-label="Open cart"
                              type="button"
                            >
                              <CartTwo />
                              <span className="tp-header-action-badge" key={`cart-${distinctCount}`}>{distinctCount}</span>
                            </button>
                          </div>
                        )}

                        {/* Mobile hamburger */}
                        <div className="tp-header-action-item tp-header-hamburger d-xl-none">
                          <button onClick={() => setIsCanvasOpen(true)} type="button" className="tp-offcanvas-open-btn" aria-label="Open menu">
                            <FiMenu />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                  {/* end */}
                </div>
              </div>
            </div>

            {/* FULL-WIDTH underline inside the sticky header (stays on scroll) */}
            {/* <div className={`brand-underline-full ${sticky ? 'is-sticky' : ''}`} aria-hidden="true" /> */}
          </div>
        </div>
      </header>

      <CartMiniSidebar />
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsCanvasOpen={setIsCanvasOpen} categoryType="fashion" />

      <style jsx>{`
        .search-spacer { margin-right: 24px !important; }
        @media (min-width: 992px)  { .search-spacer { margin-right: 32px !important; } }
        @media (min-width: 1200px) { .search-spacer { margin-right: 40px !important; } }
        .tp-header-search-2 form { position: relative; }
        .tp-header-search-2 input { padding-right: 44px; }
        .tp-header-search-2 button { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: 0; display: inline-flex; align-items: center; }

        .search-dropdown{
          position:absolute;
          margin-top:8px;
          width:480px;
          max-height:420px;
          overflow:auto;
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:12px;
          box-shadow: 0 18px 40px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
          padding:6px;
          z-index: 50;
        }
        .search-item{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:10px 12px;
          border-radius:8px;
          background:#fff;
          color:#0f172a;
          border:0;
          text-align:left;
          cursor:pointer;
        }
        .search-item:hover, .search-item.active{ background:#eef2ff; }
        .search-item.muted{ color:#6b7280; cursor:default; }
        .search-name{ font-weight:600; }
        .search-price{ font-weight:600; color:#0b1620; }

        /* ===== Full-width gradient underline (sticks & thins on scroll) ===== */
        .brand-underline-full{
          position:absolute;
          left:50%;
          bottom:-6px;
          transform:translateX(-50%);
          width:100vw;
          height:10px;
          background: linear-gradient(90deg, #E6B354, #C7A458, #7F8DB8, #4866C1);
          border-radius:9999px;
          box-shadow:0 0 0 1px rgba(255,255,255,.06) inset;
          pointer-events:none;
        }
        .brand-underline-full.is-sticky{
          height:6px;
          bottom:-5px;
        }
        @media (max-width:480px){
          .brand-underline-full{ height:8px; bottom:-5px; }
          .brand-underline-full.is-sticky{ height:5px; bottom:-4px; }
        }

        /* Dropdown (account) */
        .user-menu-dropdown{
          position:absolute;
          right:0;
          top:calc(100% + 12px);
          z-index:10000;
          min-width: 230px;
          background:#fff;
          border-radius:12px;
          box-shadow: 0 18px 40px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.06);
          overflow:hidden;
          animation:menuPop .14s ease-out both;
        }
        .user-menu-dropdown::before{
          content:"";
          position:absolute;
          right:18px;
          top:-7px;
          width:14px;height:14px;
          background:#fff;
          transform:rotate(45deg);
          box-shadow:-2px -2px 6px rgba(0,0,0,.05);
        }
        .user-menu-inner{ display:flex; flex-direction:column; gap:6px; padding:8px; }
        .user-item{
          display:block !important; width:100%; padding:10px 14px; border-radius:8px;
          font-size:14px; line-height:1.25; color:#111827; background:transparent; border:0; text-align:left;
          cursor:pointer; transition:background .15s ease,color .15s ease,transform .02s ease;
        }
        .user-item:hover{ background:#f3f4f6; }
        .user-item:focus-visible{ outline:none; background:#eef2ff; box-shadow:0 0 0 3px rgba(99,102,241,.25) inset; }
        .user-item:active{ transform:scale(.995); }
        .user-item.danger{ color:#b91c1c; }
        .user-item.danger:hover{ background:#fee2e2; }
        .user-divider{ height:1px; background:#e5e7eb; margin:2px 6px; border-radius:1px; }
        @keyframes menuPop{ from{ transform:translateY(-4px); opacity:0; } to{ transform:translateY(0); opacity:1; } }
        @media (max-width:480px){ .user-menu-dropdown{ min-width:210px; right:-8px; } .user-menu-dropdown::before{ right:24px; } }

        /* Auth CTA (logged-out) */
        .tp-auth-cta{
          display:inline-flex;
          align-items:center;
          gap:10px;
          padding:10px 16px;
          min-height:40px;
          background:#eef2f7;
          color:#111827;
          border:1px solid #cfd6df;
          border-radius:12px;
          text-decoration:none;
          font-weight:600;
          line-height:1;
          white-space:nowrap;
          transition:background .15s ease, box-shadow .15s ease, transform .02s ease;
        }
        .tp-auth-cta:hover{
          background:#e7ecf3;
          box-shadow:0 1px 0 rgba(17,24,39,.06) inset;
        }
        .tp-auth-cta:active{ transform:translateY(0.5px); }

        .tp-auth-cta-text{
          display:inline-flex;
          align-items:center;
          gap:8px;
          white-space:nowrap;
          line-height:1;
        }
        .tp-auth-cta-text svg,
        .tp-auth-cta-icon{
          width:18px;
          height:18px;
          flex:0 0 auto;
          display:inline-block;
          vertical-align:middle;
        }
      `}</style>
    </>
  );
};

export default HeaderTwo;
