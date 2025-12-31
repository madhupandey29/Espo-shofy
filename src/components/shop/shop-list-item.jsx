'use client';
import React from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { CompareThree, QuickView, Wishlist, Cart } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_to_cart, fetch_cart_products, openCartMini } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import { add_to_compare } from "@/redux/features/compareSlice";

import { useGetSubstructureQuery } from "@/redux/features/substructureApi";
import { useGetContentByIdQuery } from "@/redux/features/contentApi";
import { useGetSubfinishQuery } from "@/redux/features/subfinishApi";

/* --------------------------- helpers --------------------------- */
const nonEmpty = (v) =>
  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== "";
const pick = (...xs) => xs.find(nonEmpty);
const at = (obj, path) =>
  path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
const normId = (v) => {
  if (!v) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") return v._id || v.id || v.value || null;
  return null;
};

/** Keep this identical to your wishlist’s session reading style */
const getSessionUser = () => {
  if (typeof window === 'undefined') return { sessionId: null, userId: null };
  return {
    sessionId: localStorage.getItem('sessionId') || null,
    userId: localStorage.getItem('userId') || null,
  };
};

/** Fire the same login modal event your header listens for */
const openLoginModal = () => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("auth:open", { detail: { mode: "login" } }));
  } catch (err) {
    console.log("auth:open event error", err);
  }
};

const ShopListItem = ({ product }) => {
  const { img, image, title, price, salesPrice, discount, description } = product || {};
  const dispatch = useDispatch();

  /** Gate add-to-cart behind session like wishlist does */
  const guardedAddToCart = async (prd) => {
    const { sessionId, userId } = getSessionUser();
    if (!sessionId || !userId) { openLoginModal(); return; }
    try {
      const pid = prd?._id || prd?.id || prd?.productId;
      if (!pid) return;
      await dispatch(add_to_cart({ userId, productId: pid, quantity: 1 })).unwrap();
      await dispatch(fetch_cart_products({ userId }));
      dispatch(openCartMini());
    } catch (e) {
      // ignore
    }
  };

  const handleWishlistProduct = (prd) => dispatch(add_to_wishlist(prd));
  const handleCompareProduct = (prd) => dispatch(add_to_compare(prd));

  const isCloudinaryUrl = (url) =>
    url && (url.includes("res.cloudinary.com") || url.startsWith("https://"));

  const getImageUrl = (imageLike) => {
    if (!imageLike) return "/assets/img/product/default-product-img.jpg";
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
      if (typeof imageLike === "string" && imageLike.startsWith("[object Object]"))
        return "/assets/img/product/default-product-img.jpg";
      if (typeof imageLike === "object" && imageLike !== null) {
        if (imageLike.url) return imageLike.url;
        if (imageLike.filename) return `${baseUrl}/uploads/${imageLike.filename.replace(/^\/+/, "")}`;
        if (imageLike.path) return `${baseUrl}/uploads/${imageLike.path.replace(/^\/+/, "")}`;
        return "/assets/img/product/default-product-img.jpg";
      }
      if (typeof imageLike === "string" && isCloudinaryUrl(imageLike)) return imageLike;
      if (typeof imageLike === "string") return `${baseUrl}/uploads/${imageLike.replace(/^\/+/, "")}`;
      return "/assets/img/product/default-product-img.jpg";
    } catch {
      return "/assets/img/product/default-product-img.jpg";
    }
  };

  const imageUrl     = getImageUrl(img || image);
  const isCloudinary = isCloudinaryUrl(imageUrl);
  const slug         = product?.slug || '';

  const titleText =
    pick(product?.name, product?.product?.name, product?.productname, title, product?.productTitle) || "—";

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
      .format(Number(n));

  const basePrice = typeof price === "number" ? price : Number(price) || null;
  const salePrice = typeof salesPrice === "number" ? salesPrice : null;
  const effectivePrice =
    salePrice ?? (discount > 0 && basePrice ? basePrice - (basePrice * Number(discount)) / 100 : basePrice);
  const showOld = (salePrice && basePrice && salePrice !== basePrice) || (discount > 0 && basePrice);

  /* robust id extraction */
  const structureId = normId(
    pick(
      at(product, "structureId"),
      at(product, "substructureId"),
      at(product, "substructure"),
      at(product, "structure"),
      at(product, "product.structureId"),
      at(product, "product.substructureId"),
      at(product, "product.substructure"),
      at(product, "product.structure")
    )
  );
  const contentId = normId(
    pick(
      at(product, "contentId"),
      at(product, "content"),
      at(product, "product.contentId"),
      at(product, "product.content")
    )
  );
  const finishId = normId(
    pick(
      at(product, "finishId"),
      at(product, "subfinishId"),
      at(product, "subfinish"),
      at(product, "finish"),
      at(product, "product.finishId"),
      at(product, "product.subfinishId"),
      at(product, "product.subfinish"),
      at(product, "product.finish")
    )
  );

  const { data: structResp,  isLoading: structLoading,  isError: structError }  =
    useGetSubstructureQuery(structureId, { skip: !structureId });
  const { data: contentResp, isLoading: contentLoading, isError: contentError } =
    useGetContentByIdQuery(contentId,   { skip: !contentId });
  const { data: finishResp,  isLoading: finishLoading,  isError: finishError } =
    useGetSubfinishQuery(finishId,      { skip: !finishId });

  const structureName = structureId
    ? (structLoading ? "Loading…" : (structError ? "—" : (structResp?.data?.name || "—")))
    : "—";
  const contentName = contentId
    ? (contentLoading ? "Loading…" : (contentError ? "—" : (contentResp?.data?.name || "—")))
    : "—";
  const finishName = finishId
    ? (finishLoading ? "Loading…" : (finishError ? "—" : (finishResp?.data?.name || "—")))
    : "—";

  const gsmValue   = nonEmpty(product?.gsm)   ? product?.gsm   : "—";
  const widthValue = nonEmpty(product?.width) ? product?.width : "—";

  /* small row component: label/value alignment only */
  const Row = ({ label, value }) => (
    <div
      className="tp-product-details-query-item d-flex align-items-center"
      style={{ gap: 12, marginTop: 8 }}
    >
      <span
        style={{
          minWidth: 86,
          fontSize: 14,
          lineHeight: '20px',
          color: '#6B7280',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: '20px',
          color: '#0B1223',
          fontWeight: 500,
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div className="tp-product-list-item d-md-flex">
      <div className="tp-product-list-thumb p-relative fix">
        <Link href={`/fabric/${slug}`}>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={titleText || "product image"}
              width={350}
              height={310}
              style={{ color: "transparent" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 350px"
              unoptimized={isCloudinary}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/img/product/default-product-img.jpg";
              }}
            />
          )}
        </Link>

        {/* actions */}
        <div className="tp-product-action-2 tp-product-action-blackStyle">
          <div className="tp-product-action-item-2 d-flex flex-column">
            <button
              type="button"
              className="tp-product-action-btn-2 tp-product-quick-view-btn"
              onClick={() => dispatch(handleProductModal(product))}
            >
              <QuickView />
              <span className="tp-product-tooltip tp-product-tooltip-right">Quick View</span>
            </button>

            {/* ❤️ Wishlist */}
            <button
              type="button"
              onClick={() => handleWishlistProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-wishlist-btn hover:text-sky-500 focus:text-sky-500 active:text-sky-500 transition-colors"
            >
              <Wishlist />
              <span className="tp-product-tooltip tp-product-tooltip-right">Add To Wishlist</span>
            </button>

            {/* 🛒 Cart icon → same gate as wishlist page */}
            <button
              type="button"
              onClick={() => guardedAddToCart(product)}
              className="tp-product-action-btn-2 tp-product-add-to-cart-btn"
            >
              <Cart />
              <span className="tp-product-tooltip tp-product-tooltip-right">Add To Cart</span>
            </button>

            {/* ⇄ Compare */}
            <button
              type="button"
              onClick={() => handleCompareProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
            >
              <CompareThree />
              <span className="tp-product-tooltip tp-product-tooltip-right">Add To Compare</span>
            </button>
          </div>
        </div>
      </div>

      <div className="tp-product-list-content">
        <div className="tp-product-content-2 pt-15">
          <div className="tp-product-tag-2" />

          <h3 className="tp-product-title-2">
            <Link href={`/fabric/${slug}`}>{titleText}</Link>
          </h3>

          <div className="tp-product-rating-icon tp-product-rating-icon-2" aria-hidden="true" />

          <div className="tp-product-price-wrapper-2">
            {effectivePrice != null ? (
              <>
                <span className="tp-product-price-2 new-price">{formatINR(effectivePrice)}</span>
                {showOld ? (
                  <span className="tp-product-price-2 old-price">{formatINR(basePrice)}</span>
                ) : null}
              </>
            ) : (
              <span className="tp-product-price-2 new-price">—</span>
            )}
          </div>

          <p>{description?.substring(0, 100)}</p>

          {/* Details */}
          <div className="tp-product-details-query" style={{ marginBottom: 10 }}>
            <Row label="Structure:" value={structureName} />
            <Row label="Content:"   value={contentName} />
            <Row label="Finish:"    value={finishName} />
            <Row label="GSM:"       value={gsmValue} />
            <Row label="Width:"     value={widthValue} />
          </div>

          {/* Add To Cart button with the same guarded logic */}
          <div className="tp-product-list-add-to-cart">
            <button
              onClick={() => guardedAddToCart(product)}
              className="tp-product-list-add-to-cart-btn"
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListItem;
