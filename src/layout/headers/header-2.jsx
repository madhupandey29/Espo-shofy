'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';

import useSticky from '@/hooks/use-sticky';
import useCartInfo from '@/hooks/use-cart-info';
import useGlobalSearch from '@/hooks/useGlobalSearch';

import { fetch_cart_products } from '@/redux/features/cartSlice';
import CartMiniSidebar from '@/components/common/cart-mini-sidebar';
import OffCanvas from '@/components/common/off-canvas';
import Menus from './header-com/menus';

import { CartTwo, Search } from '@/svg';
import { FaHeart, FaUser } from 'react-icons/fa';
import { useGetSessionInfoQuery } from '@/redux/features/auth/authApi';
import { FiMenu } from 'react-icons/fi';

/* =========================
   Helpers
========================= */
const PAGE_SIZE = 20;
const MAX_LIMIT = 200;
const nonEmpty = (v) => v !== undefined && v !== null && String(v).trim() !== '';

const selectUserIdFromStore = (state) =>
  state?.auth?.user?._id ||
  state?.auth?.user?.id ||
  state?.auth?.userInfo?._id ||
  state?.auth?.userInfo?.id ||
  state?.user?.user?._id ||
  null;

function normalizeProduct(p) {
  const id = p._id || p.id || p.fabricCode || p.productslug || p.slug || String(Date.now());
  const slug = p.productslug || p.slug || p.seoSlug || p.handle || '';
  const name = p.name || p.title || p.productname || p.productName || 'Untitled';

  const img =
    p.image1CloudUrl ||
    p.image2CloudUrl ||
    p.image3CloudUrl ||
    p.image ||
    p.img ||
    p.thumbnail ||
    (Array.isArray(p.images) ? p.images[0] : null) ||
    p.mainImage ||
    p.picture ||
    '/assets/img/product/default-product-img.jpg';

  const price = p.salesPrice || p.price || p.mrp || p.minPrice || null;

  return { id, slug, name, img, price, ...p };
}

/** ✅ Your search API */
async function searchProducts(q, limit = PAGE_SIZE, signal) {
  const primaryUrl = `https://espobackend.vercel.app/api/product/search/${encodeURIComponent(q)}`;

  try {
    const res = await fetch(primaryUrl, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        return data.data.slice(0, limit).map(normalizeProduct);
      }
    }
  } catch (err) {}

  // Optional fallback (can remove if you want)
  const b = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
  const fallbackQueries = [
    `${b}/product/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    `${b}/product?q=${encodeURIComponent(q)}&limit=${limit}`,
    `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  ];

  for (const url of fallbackQueries) {
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
      return arr.slice(0, limit).map(normalizeProduct);
    } catch (err) {}
  }

  return [];
}

/** Avatar fetch (kept) */
const SHOPY_API_BASE = 'https://test.amrita-fashions.com/shopy';
async function fetchUserAvatarById(userId, signal) {
  if (!userId) return null;
  try {
    const res = await fetch(`${SHOPY_API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      credentials: 'include',
      signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
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
  const pathname = usePathname();

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

  // ===== cart count =====
  const { quantity: cartCount } = useCartInfo();
  const distinctCount = cartCount ?? 0;

  useEffect(() => {
    if (userId) dispatch(fetch_cart_products({ userId }));
  }, [dispatch, userId]);

  const [isOffCanvasOpen, setIsCanvasOpen] = useState(false);

  // ===== GLOBAL SEARCH =====
  const { query, setQuery, debounced, reset } = useGlobalSearch(150);

  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState([]);
  const [selIndex, setSelIndex] = useState(-1);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // ✅ only open product page if user explicitly selects with arrow keys
  const [explicitPick, setExplicitPick] = useState(false);

  const searchWrapRef = useRef(null);
  const dropRef = useRef(null);

  // reset pagination when query changes
  useEffect(() => setLimit(PAGE_SIZE), [debounced]);

  /**
   * ✅ IMPORTANT FIX:
   * Fetch suggestions ONLY when dropdown is open.
   * So after redirect to /shop?q=... dropdown stays closed and no "Nokia-..." line appears.
   */
  useEffect(() => {
    const controller = new AbortController();
    const q = (debounced || '').trim();

    if (q.length < 2) {
      setResults([]);
      setSelIndex(-1);
      setExplicitPick(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    // ✅ do not fetch / render suggestions unless dropdown is open
    if (!searchOpen) {
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);

    searchProducts(q, Math.min(limit, MAX_LIMIT), controller.signal)
      .then((arr) => {
        setResults(arr);
        setSelIndex(-1);        // no auto-select
        setExplicitPick(false); // reset explicit selection
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debounced, limit, searchOpen]);

  // infinite scroll inside dropdown
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

  // close dropdown on outside click / Esc
  useEffect(() => {
    const onDoc = (e) => {
      const w = searchWrapRef.current;
      if (!w) return;
      if (!(e.target instanceof Node)) return;
      if (!w.contains(e.target)) setSearchOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };

    document.addEventListener('mousedown', onDoc, true);
    document.addEventListener('touchstart', onDoc, true);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onDoc, true);
      document.removeEventListener('touchstart', onDoc, true);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const closeOnlyDropdown = () => {
    setSearchOpen(false);
    setResults([]);
    setSelIndex(-1);
    setLimit(PAGE_SIZE);
    setExplicitPick(false);
  };

  const go = (href, opts = {}) => {
    const keepQuery = !!opts.keepQuery;

    closeOnlyDropdown();
    if (!keepQuery) reset();

    try { window.scrollTo?.(0, 0); } catch (err) {}
    router.push(href);
  };

  // ✅ Submit:
  // default -> shop
  // only -> product-details if explicitPick=true and selected item has slug
  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = (query || '').trim();

    if (!q) {
      setSearchOpen(true);
      return;
    }

    if (explicitPick && selIndex >= 0 && results[selIndex]) {
      const p = results[selIndex];
      if (p?.slug) {
        go(`/product-details/${p.slug}`, { keepQuery: false }); // ✅ slug only
        return;
      }
    }

    go(`/shop?q=${encodeURIComponent(q)}`, { keepQuery: true });
  };

  const onSearchKeyDown = (e) => {
    if (!searchOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!results.length) return;
      setExplicitPick(true);
      setSelIndex((i) => Math.min(results.length - 1, i < 0 ? 0 : i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!results.length) return;
      setExplicitPick(true);
      setSelIndex((i) => Math.max(-1, i - 1));
    }
  };

  // clear: remove query and show all products
  const clearSearch = () => {
    closeOnlyDropdown();
    reset();
    router.push('/shop');
  };

  // close dropdown when route changes (extra safety)
  useEffect(() => {
    closeOnlyDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ===== Session & user dropdown =====
  const [hasSession, setHasSession] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  const { data: userData } = useGetSessionInfoQuery(
    { userId },
    { skip: !userId, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (userData?.user?.userImage) setUserImage(userData.user.userImage);
    else if (userData?.user?.avatar) setUserImage(userData.user.avatar);
  }, [userData]);

  useEffect(() => {
    if (!userId) return;
    if (userImage && typeof userImage === 'string' && userImage.trim()) return;

    const controller = new AbortController();
    fetchUserAvatarById(userId, controller.signal).then((url) => {
      if (url) setUserImage(url);
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
      const btn = userBtnRef.current;
      const menu = userMenuRef.current;
      const t = e.target;
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
            .catch(() => {});
        } catch {}
      }
    } finally {
      setHasSession(false);
      setUserOpen(false);
      router.push('/');
    }
  };

  const onOpenCart = () => router.push('/cart');

  const currentUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/';
    const url = new URL(window.location.href);
    return url.pathname + url.search;
  }, []);

  useEffect(() => {
    try {
      ['/shop', '/wishlist', '/cart', '/profile', '/login', '/register'].forEach((p) => {
        if (router.prefetch) router.prefetch(p);
      });
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
                      <div className="tp-header-search-2 d-none d-sm-block me-3 search-wrap" ref={searchWrapRef}>
                        <form onSubmit={onSearchSubmit} className="search-form">
                          <input
                            value={query || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setQuery(v);
                              setExplicitPick(false);
                              if (v && !searchOpen) setSearchOpen(true);
                              if (!v) closeOnlyDropdown();
                            }}
                            onKeyDown={onSearchKeyDown}
                            type="text"
                            placeholder="Search for Products..."
                            aria-label="Search products"
                            autoComplete="off"
                            spellCheck={false}
                            inputMode="search"
                            maxLength={200}
                            onFocus={() => {
                              if (nonEmpty(query)) setSearchOpen(true);
                            }}
                            className="search-input"
                          />

                          {!!(query && query.trim()) && (
                            <button
                              type="button"
                              className="search-clear"
                              onClick={clearSearch}
                              aria-label="Clear search"
                              title="Clear"
                            >
                              ×
                            </button>
                          )}

                          <button
                            type="submit"
                            className="search-submit"
                            aria-label="Search"
                            onClick={() => {
                              // ensure dropdown doesn't force-open on submit
                              // (submit will go to /shop by default)
                            }}
                          >
                            <Search />
                          </button>
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
                              const active = i === selIndex;
                              return (
                                <button
                                  key={`${p.id}-${i}`}
                                  type="button"
                                  className={`search-item ${active ? 'active' : ''}`}
                                  onMouseEnter={() => setSelIndex(i)}
                                  onClick={() => {
                                    // ✅ click opens product only if slug exists
                                    if (p?.slug) {
                                      go(`/product-details/${p.slug}`, { keepQuery: false });
                                    } else {
                                      go(`/shop?q=${encodeURIComponent(query)}`, { keepQuery: true });
                                    }
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
                                        border: '1px solid rgba(0,0,0,0.1)',
                                      }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
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
                                    <button className="user-item" type="button" role="menuitem" onClick={() => { setUserOpen(false); router.push('/profile'); }}>
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
                          <Link href="/wishlist" className="tp-header-action-btn" aria-label="Wishlist" prefetch>
                            <FaHeart /><span className="tp-header-action-badge">{wishlistCount}</span>
                          </Link>
                        </div>

                        {/* Cart */}
                        {hasSession && (
                          <div className="tp-header-action-item me-2">
                            <button onClick={onOpenCart} className="tp-header-action-btn cartmini-open-btn" aria-label="Open cart" type="button">
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
          </div>
        </div>
      </header>

      <CartMiniSidebar />
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsCanvasOpen={setIsCanvasOpen} categoryType="fashion" />

      <style jsx>{`
        .search-wrap { position: relative; }

        .search-form{
          position: relative;
          width: 480px;
          max-width: 52vw;
        }
        @media (max-width: 1199px){ .search-form{ width: 440px; } }
        @media (max-width: 991px){ .search-form{ width: 360px; max-width: 56vw; } }

        .search-input{
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #cfd6df;
          background: #fff;
          color: #0f172a;
          font-size: 14px;
          padding: 0 78px 0 14px;
          outline: none;
        }
        .search-input::placeholder{ color: #6b7280; }

        .search-submit{
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          height: 34px;
          width: 34px;
          border: 0;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          z-index: 2;
        }

        .search-clear{
          position: absolute;
          right: 46px;
          top: 50%;
          transform: translateY(-50%);
          height: 30px;
          width: 30px;
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 22px;
          line-height: 1;
          color: #6b7280;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          z-index: 2;
        }
        .search-clear:hover{ color: #111827; background: #f3f4f6; }

        .search-dropdown{
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          max-height: 420px;
          overflow: auto;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 18px 40px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
          padding: 6px;
          z-index: 50;
        }

        .search-item{
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #fff;
          color: #0f172a;
          border: 0;
          text-align: left;
          cursor: pointer;
        }
        .search-item:hover, .search-item.active{ background: #eef2ff; }
        .search-item.muted{ color:#6b7280; cursor: default; }

        .search-name{ font-weight: 600; }
        .search-price{ font-weight: 600; color: #0b1620; }

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
          cursor:pointer;
        }
        .user-item:hover{ background:#f3f4f6; }
        .user-item.danger{ color:#b91c1c; }
        .user-item.danger:hover{ background:#fee2e2; }
        .user-divider{ height:1px; background:#e5e7eb; margin:2px 6px; border-radius:1px; }
        @keyframes menuPop{ from{ transform:translateY(-4px); opacity:0; } to{ transform:translateY(0); opacity:1; } }

        /* Auth CTA */
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
        }
        .tp-auth-cta:hover{ background:#e7ecf3; }
        .tp-auth-cta-text{ display:inline-flex; align-items:center; gap:8px; white-space:nowrap; }
      `}</style>
    </>
  );
};

export default HeaderTwo;
