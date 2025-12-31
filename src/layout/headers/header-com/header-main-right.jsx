'use client';
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
// internal
import { useRouter } from 'next/navigation';
import useCartInfo from "@/hooks/use-cart-info";
import { CartTwo, Compare, Menu, User, Wishlist } from "@/svg";

/* ---------- helpers ---------- */
const isRemote = (url) => !!url && /^https?:\/\//i.test(url);
const isCloudinaryUrl = (url) => !!url && /res\.cloudinary\.com/i.test(url);

const pickAvatarUrl = (u) => {
  const raw =
    u?.userImage ||
    u?.avatar ||
    u?.avatarUrl ||
    u?.imageURL ||
    u?.imageUrl ||
    "";

  const v = String(raw || "").trim();
  if (!v) return "";
  if (isRemote(v)) return v;

  // if you ever store relative paths for user image
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
  if (!base) return v;
  const cleanPath = v.startsWith("/") ? v.slice(1) : v;
  return `${base}/${cleanPath}`.replace(/([^:])\/{2,}/g, "$1/");
};

const firstLetter = (name = "") =>
  String(name || "").trim().charAt(0).toUpperCase();

const HeaderMainRight = ({ setIsCanvasOpen }) => {
  const { user: userInfo } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { quantity } = useCartInfo();
  const dispatch = useDispatch();
  const router = useRouter();

  const avatarUrl = useMemo(() => pickAvatarUrl(userInfo), [userInfo]);
  const hasName = !!String(userInfo?.name || "").trim();

  return (
    <div className="tp-header-main-right d-flex align-items-center justify-content-end">
      <div className="tp-header-login d-none d-lg-block">
        <div className="d-flex align-items-center">
          <div className="tp-header-login-icon">
            <span>
              {avatarUrl ? (
                <Link href="/profile" aria-label="Open profile" title="Profile">
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    title="Profile"
                    width={35}
                    height={35}
                    loading="lazy"
                    unoptimized={isCloudinaryUrl(avatarUrl)}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                </Link>
              ) : hasName ? (
                <Link href="/profile" aria-label="Open profile" title="Profile">
                  <h2 className="text-uppercase login_text" title="Profile">
                    {firstLetter(userInfo?.name)}
                  </h2>
                </Link>
              ) : (
                <span title="Account">
                  <User />
                </span>
              )}
            </span>
          </div>

          <div className="tp-header-login-content d-none d-xl-block">
            {!hasName && (
              <Link href="/login">
                <span>Hello,</span>
              </Link>
            )}
            {hasName && <span>Hello, {userInfo?.name}</span>}

            <div className="tp-header-login-title">
              {!hasName && <Link href="/login">Sign In</Link>}
              {hasName && <Link href="/profile">Your Account</Link>}
            </div>
          </div>
        </div>
      </div>

      <div className="tp-header-action d-flex align-items-center ml-50">
        <div className="tp-header-action-item d-none d-lg-block">
          <Link href="/compare" className="tp-header-action-btn" aria-label="Compare" title="Compare">
            <Compare />
          </Link>
        </div>

        <div className="tp-header-action-item d-none d-lg-block">
          <Link href="/wishlist" className="tp-header-action-btn" aria-label="Wishlist" title="Wishlist">
            <Wishlist />
            <span className="tp-header-action-badge">{wishlist.length}</span>
          </Link>
        </div>

        <div className="tp-header-action-item">
          <button
            onClick={() => router.push('/cart')}
            type="button"
            className="tp-header-action-btn cartmini-open-btn"
            aria-label="Open cart"
            title="Cart"
          >
            <CartTwo />
            <span className="tp-header-action-badge">{quantity}</span>
          </button>
        </div>

        <div className="tp-header-action-item d-lg-none">
          <button
            onClick={() => setIsCanvasOpen(true)}
            type="button"
            className="tp-header-action-btn tp-offcanvas-open-btn"
            aria-label="Open menu"
            title="Menu"
          >
            <Menu />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMainRight;
