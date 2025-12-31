'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import { useRouter } from 'next/navigation';

import { handleModalClose } from '@/redux/features/productModalSlice';
import DetailsThumbWrapper from '@/components/product-details/details-thumb-wrapper';
import DetailsWrapper from '@/components/product-details/details-wrapper';
import { initialOrderQuantity } from '@/redux/features/cartSlice';

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('body');
}

/* helpers */
const toUrl = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return toUrl(v[0]);
  if (typeof v === 'object') return toUrl(v.secure_url || v.url || v.path || v.key);
  return '';
};
const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

/** Big, centered, no outer scroll */
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: 'min(1180px, 96vw)',
    maxHeight: '92vh',
    padding: '16px 22px 18px',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
  }
};

// Mobile-specific modal styles
const mobileStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: '95vw',
    maxWidth: '95vw',
    maxHeight: '95vh',
    padding: '12px 16px 14px',
    borderRadius: '10px',
    overflow: 'auto', // Allow scrolling on mobile
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
  }
};

export default function ProductModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { productItem, isModalOpen, nonce } = useSelector((s) => s.productModal);
  
  // Mobile detection hook
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to product page on mobile when modal opens
  useEffect(() => {
    if (isModalOpen && isMobile && productItem?.slug) {
      dispatch(handleModalClose());
      router.push(`/fabric/${productItem.slug}`);
    }
  }, [isModalOpen, isMobile, productItem?.slug, dispatch, router]);

  const normalized = useMemo(() => {
    const p = productItem || {};
    return {
      ...p,
      title: p.title || p.name || '',
      category: p.category || p.newCategoryId,
      structureId: p.structureId || idOf(p.substructure) || idOf(p.structure),
      contentId: p.contentId || idOf(p.content),
      finishId: p.finishId || idOf(p.subfinish) || idOf(p.finish),
      gsm: p.gsm ?? p.GSM,
      width: p.width ?? p.widthCm ?? p.Width,
      slug: p.slug || p._id,
    };
  }, [productItem]);

  const imageURLs = useMemo(() => {
    if (!productItem) return [];
    const items = [
      productItem?.img && { img: toUrl(productItem.img), type: 'image' },
      productItem?.image1 && { img: toUrl(productItem.image1), type: 'image' },
      productItem?.image2 && { img: toUrl(productItem.image2), type: 'image' },
    ].filter(Boolean);
    if (productItem?.video) items.push({ img: productItem?.videoThumbnail || '/assets/img/product/-video-thumb.png', type: 'video', video: toUrl(productItem.video) });
    return items;
  }, [productItem]);

  const mainImg = productItem?.img || imageURLs[0]?.img || '';
  const [activeImg, setActiveImg] = useState(mainImg);
  useEffect(() => {
    setActiveImg(mainImg);
    if (productItem) dispatch(initialOrderQuantity());
  }, [mainImg, productItem, dispatch]);

  const handleImageActive = (item) => setActiveImg(item.img);

  if (!normalized || !isModalOpen || isMobile) return null;

  const modalKey = `${normalized._id || normalized.slug || 'item'}-${nonce ?? 0}`;

  const goToDetails = (e) => {
    e?.preventDefault?.();
    dispatch(handleModalClose());
    router.push(`/fabric/${normalized.slug}`);
  };

  return (
    <ReactModal
      key={modalKey}
      isOpen
      onRequestClose={() => dispatch(handleModalClose())}
      style={isMobile ? mobileStyles : customStyles}
      shouldCloseOnOverlayClick
      bodyOpenClassName="ReactModal__Body--open"
      contentLabel="Product Modal"
    >
      {/* top bar: keep your button classnames */}
      <div className="pm-topbar" role="toolbar" aria-label="Quick view actions">
        <button
          type="button"
          className="tp-btn tp-btn-blue"
          onClick={goToDetails}
          aria-label="View fabric details"
        >
          View Details
        </button>
        <button
          onClick={() => dispatch(handleModalClose())}
          type="button"
          className="tp-product-modal-close-btn"
          aria-label="Close quick view"
          title="Close"
        >
          <i className="fa-regular fa-xmark" />
        </button>
      </div>

      {/* body grid */}
      <div className="pm-body" key={`content-${modalKey}`}>
        <div className="pm-media">
          <DetailsThumbWrapper
            key={`thumbs-${modalKey}`}
            activeImg={productItem?.img || activeImg}
            handleImageActive={handleImageActive}
            /* pass full product object for all image fields */
            apiImages={productItem}
            /* pass group code data for additional media */
            groupCodeData={productItem?.groupcode}
            /* explicit media props from backend */
            img={productItem?.img}
            image1={productItem?.image1}
            image2={productItem?.image2}
            image3={productItem?.image3}
            video={productItem?.video}
            videourl={productItem?.videourl}
            videoThumbnail={productItem?.videoThumbnail}
            /* keep extras merged after the primaries */
            imageURLs={imageURLs}
            /* wider viewer inside modal; disable external zoom pane */
            imgWidth={420}
            imgHeight={420}
            zoomPaneWidth={0}
            /* keep thumbs scrollable by giving them height */
            zoomPaneHeight={420}
            status={normalized?.status}
            /* keep videoId fallback for safety */
            videoId={productItem?.video}
          />
        </div>

        <div className="pm-details">
          <DetailsWrapper
            key={`details-${modalKey}`}
            productItem={normalized}
            handleImageActive={handleImageActive}
            activeImg={activeImg}
          />
        </div>
      </div>

      {/* classy/clean look */}
      <style jsx>{`
        .pm-topbar{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:6px;
        }
        :global(.tp-product-modal-close-btn){ position:static; }

        .pm-body{
          display:grid;
          grid-template-columns: 540px 1fr; /* allow thumbs + main image to fit */
          gap:20px;
          max-height: calc(92vh - 60px);
          overflow-y:auto; /* allow scroll on small screens */
        }

        .pm-media{
          display:flex;
          align-items:center;
          justify-content:center;
          min-width:0;
          height:100%;
          max-height:100%;
          overflow:hidden; /* thumbnails self-manage scroll if they need it */
          background:#fff;
        }
        .pm-media :global(img){
          max-width:100%;
          max-height:100%;
          width:auto;
          height:auto;
          object-fit:contain !important;
          display:block;
        }

        .pm-details{
          min-width:0;
          max-height:100%;
          overflow-y:auto;
          overflow-x:hidden; /* remove bottom horizontal scrollbar */
          padding-right: 4px; /* avoid text under scrollbar on Windows */
        }

        /* ———————— Classy typography & spacing in the details ———————— */

        /* Large, elegant title (handles long titles better) */
        :global(.tp-product-details h1),
        :global(.tp-product-details h2){
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.18;
          margin: 2px 0 12px 0;
          max-width: 42ch; /* nicer wrap */
        }

        /* Section subtitles (like category) */
        :global(.tp-product-details .subheading),
        :global(.tp-product-details h5){
          font-weight: 700;
          letter-spacing: .02em;
          margin: 0 0 6px 0;
          color: #111827;
        }

        /* Two-column spec block – tighter & aligned */
        :global(.tp-product-details .tp-product-details-meta){
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 28px; /* row gap / column gap */
          margin: 6px 0 14px;
        }
        :global(.tp-product-details .tp-product-details-meta p){
          display:flex;
          justify-content: space-between; /* label left, value right */
          gap: 16px;
          margin: 0;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(17,24,39,.08);
          font-size: 15px;
          line-height: 1.35;
        }
        :global(.tp-product-details .tp-product-details-meta p:last-child){
          border-bottom: none;
        }
        :global(.tp-product-details .tp-product-details-meta strong){
          color:#374151; font-weight:600;
        }
        :global(.tp-product-details .tp-product-details-meta span){
          color:#111827; font-weight:600;
        }

        /* Ratings row trimmed a bit */
        :global(.tp-product-details .tp-product-details-rating){
          margin: 6px 0 10px;
        }

        /* CTA row: equal height, equal width, classy spacing */
        :global(.tp-product-details .tp-product-details-action){
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 14px;
        }
        :global(.tp-product-details .tp-product-details-action .tp-btn){
          height: 48px;
          border-radius: 10px;
          font-weight: 700;
        }

        /* Keep wishlist/heart floating block aligned (if present) */
        :global(.tp-product-details .tp-product-details-wishlist){
          margin-left: 12px;
        }

        /* Responsiveness */
        @media (max-width: 1080px){
          .pm-body{ grid-template-columns: 420px 1fr; gap:18px; }
        }
        @media (max-width: 900px){
          .pm-body{
            grid-template-columns: 1fr;
            max-height: none; /* Remove height restriction on mobile */
            overflow-y: visible; /* Allow natural flow on mobile */
            gap: 15px;
          }
          /* Make thumbs a horizontal strip below the main image */
          :global(.pdw-wrapper){ grid-template-columns: 1fr !important; gap: 12px; }
          :global(.pdw-thumbs){ width: 100% !important; }
          :global(.pdw-thumbs-inner){ flex-direction: row !important; overflow-x: auto !important; overflow-y: hidden !important; max-height: none !important; gap: 10px !important; padding-bottom: 4px; }
          :global(.pdw-thumb){ width: 72px !important; height: 72px !important; flex: 0 0 auto; }
          :global(.tp-product-details .tp-product-details-meta){
            grid-template-columns: 1fr; /* stack specs cleanly */
          }
          :global(.tp-product-details .tp-product-details-action){
            grid-template-columns: 1fr; /* stack buttons on small screens */
          }
          
          .pm-details{
            max-height: none; /* Remove height restriction */
            overflow-y: visible; /* Allow natural flow */
          }
        }
        
        @media (max-width: 600px){
          .pm-topbar{
            justify-content: space-between; /* Keep them on same row on mobile too */
            gap: 8px;
            margin-bottom: 10px;
          }
          
          .pm-body{
            gap: 15px;
            padding: 0 5px;
          }
          
          :global(.tp-btn){
            font-size: 12px !important;
            padding: 8px 16px !important;
          }
        }
        
        @media (max-width: 480px){
          .pm-body{
            gap: 10px;
            padding: 0;
          }
        }
      `}</style>
    </ReactModal>
  );
}
