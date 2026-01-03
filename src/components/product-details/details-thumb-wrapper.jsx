'use client';

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { CgPlayButtonO } from 'react-icons/cg';

/* ---------------- helpers ---------------- */
const isRemote = (url) => !!url && /^https?:\/\//i.test(url);
const isCloudinaryUrl = (url) => !!url && /res\.cloudinary\.com/i.test(url);
const isDataUrl = (url) => !!url && /^data:/i.test(url);

// Extract YouTube video ID and generate thumbnail URL
const getYouTubeThumbnail = (url) => {
  if (!url) return null;

  // Add protocol if missing
  let processedUrl = url;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (!url.startsWith('http')) {
      processedUrl = `https://${url}`;
    }
  }

  let videoId = null;

  if (processedUrl.includes('youtu.be/')) {
    videoId = processedUrl.split('youtu.be/')[1]?.split('?')[0];
  } else if (processedUrl.includes('youtube.com/watch?v=')) {
    videoId = processedUrl.split('v=')[1]?.split('&')[0];
  } else if (processedUrl.includes('youtube.com/embed/')) {
    videoId = processedUrl.split('embed/')[1]?.split('?')[0];
  }

  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return null;
};

const processImageUrl = (url) => {
  if (!url) return null;
  
  if (isRemote(url) || isDataUrl(url)) {
    return url;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;

  // ✅ keep slashes, encode each segment safely
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  const finalUrl = `${cleanBaseUrl}/uploads/${encodedPath}`;
  
  return finalUrl;
};

const processVideoUrl = (url) => {
  if (!url) return null;
  
  // Handle YouTube URLs that might be missing protocol
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }
  
  // Handle other remote URLs
  if (isRemote(url)) return url;
  
  // Handle local video files
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  return `${cleanBaseUrl}/uploads/${encodedPath}`;
};

const uniqueByUrl = (arr) => {
  const seen = new Set();
  return (arr || []).filter((it) => {
    if (!it?.img) return false;
    const key = `${it?.type}|${it?.img}|${it?.video || ''}|${it?.source || 'unknown'}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const NO_IMG = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'>
  <rect width='100%' height='100%' fill='%23f5f5f5'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Arial' font-size='28' fill='%23999'>No image available</text>
</svg>`;

/* ---------------- component ---------------- */
const DetailsThumbWrapper = ({
  img, image1, image2, image3,
  video, videoThumbnail,
  videourl,

  imageURLs,
  apiImages,
  groupCodeData, // Using collection data instead of groupcode

  handleImageActive,
  activeImg,

  imgWidth = 416,
  imgHeight = 480,

  videoId = false,
  status,
}) => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const productName = apiImages?.name || 'Product';

  /* ---------- Build thumbs (Product API) ---------- */
  const primaryThumbs = useMemo(() => {
    const list = [];
    const productData = apiImages || {};

    const isImageUrl = (field) => {
      if (!field || typeof field !== 'string') return false;
      const t = field.trim();
      if (!t) return false;
      return (
        t.startsWith('http') ||
        t.startsWith('/') ||
        /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(t)
      );
    };

    const imageFields = [
      img || productData.img,
      image1 || productData.image1,
      image2 || productData.image2,
      image3 || productData.image3,
      productData.image4,
      productData.image5,
      productData.image6,
    ].filter(isImageUrl);

    imageFields.forEach((imageField, index) => {
      const imgUrl = processImageUrl(imageField);
      if (imgUrl) list.push({ type: 'image', img: imgUrl, source: 'product', index });
    });

    // video (product)
    const productVideoUrl = [
      videourl,
      video,
      productData.videourl,
      productData.video,
      productData.videoUrl,
    ].find((v) => typeof v === 'string' && v.trim() !== '');

    if (productVideoUrl) {
      const videoUrl = processVideoUrl(productVideoUrl);

      const poster =
        processImageUrl(videoThumbnail || productData.videoThumbnail) ||
        getYouTubeThumbnail(productVideoUrl) ||
        (imageFields.length ? processImageUrl(imageFields[0]) : null) ||
        '/assets/img/product/default-product-img.jpg';

      if (videoUrl) list.push({ type: 'video', img: poster, video: videoUrl, source: 'product' });
    }

    return list;
  }, [img, image1, image2, image3, videourl, video, videoThumbnail, apiImages]);

  /* ---------- Collection media (using collection data passed as groupCodeData) ---------- */
  const collectionMedia = useMemo(() => {
    if (!groupCodeData) return [];
    
    const media = [];

    // Collection image - using the new API structure
    const collectionImageField = [
      groupCodeData.collectionImage1CloudUrl,
      groupCodeData.collectionImage1,
      groupCodeData.img, // fallback for old structure
      groupCodeData.image,
    ].find((v) => typeof v === 'string' && v.trim() !== '' && v !== 'null');

    if (collectionImageField) {
      const collectionImageUrl = processImageUrl(collectionImageField);
      if (collectionImageUrl) {
        media.push({ 
          type: 'image', 
          img: collectionImageUrl, 
          source: 'collection',
          fallbackUrls: groupCodeData.collectionImage1Id ? [
            `https://res.cloudinary.com/age-fabric/image/upload/${groupCodeData.collectionImage1Id}.jpg`,
            `https://res.cloudinary.com/age-fabric/image/upload/collections/${groupCodeData.collectionImage1Id}.jpg`,
          ] : []
        });
      }
    }

    // Collection video - using the new API structure
    const collectionVideoUrl = [
      groupCodeData.collectionvideoURL,
      groupCodeData.collectionVideo,
      groupCodeData.videourl, // fallback for old structure
      groupCodeData.video,
    ].find((v) => typeof v === 'string' && v.trim() !== '');

    if (collectionVideoUrl) {
      const videoUrl = processVideoUrl(collectionVideoUrl);
      const poster =
        getYouTubeThumbnail(collectionVideoUrl) ||
        (media[0]?.img) || // Use collection image if available
        (primaryThumbs?.[0]?.img || null) ||
        '/assets/img/product/default-product-img.jpg';

      if (videoUrl) {
        media.push({ type: 'video', img: poster, video: videoUrl, source: 'collection' });
      }
    }

    return media;
  }, [groupCodeData, primaryThumbs]);

  /* ---------- Final list ---------- */
  const processedImageURLs = useMemo(() => {
    // Put collection media AFTER product media (5th position)
    const finalMedia = [...primaryThumbs, ...collectionMedia];
    const uniqueMedia = uniqueByUrl(finalMedia);
    
    return uniqueMedia;
  }, [primaryThumbs, collectionMedia]);

  /* ---------- Main image ---------- */
  const mainImageUrl = useMemo(() => {
    if (activeImg) return processImageUrl(activeImg);
    if (image1) return processImageUrl(image1);
    if (img) return processImageUrl(img);
    const first = processedImageURLs.find((x) => x?.type === 'image');
    return first?.img || null;
  }, [image1, img, activeImg, processedImageURLs]);

  const [mainSrc, setMainSrc] = useState(mainImageUrl);

  useEffect(() => {
    if (mainImageUrl && mainImageUrl !== mainSrc) {
      setMainSrc(mainImageUrl);
      setIsVideoActive(false);
      setCurrentVideoUrl(null);
      if (typeof handleImageActive === 'function') {
        handleImageActive({ img: mainImageUrl, type: 'image' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImageUrl]);

  const onThumbClick = (item, index) => {
    setCurrentSlide(index);
    if (item.type === 'video') {
      setIsVideoActive(true);
      setCurrentVideoUrl(item.video || videoId || null);
    } else {
      setIsVideoActive(false);
      setCurrentVideoUrl(null);
      setMainSrc(item.img);
      if (typeof handleImageActive === 'function') handleImageActive({ img: item.img, type: 'image' });
    }
  };

  const nextSlide = () => {
    if (!processedImageURLs?.length) return;
    const nextIndex = (currentSlide + 1) % processedImageURLs.length;
    onThumbClick(processedImageURLs[nextIndex], nextIndex);
  };

  const prevSlide = () => {
    if (!processedImageURLs?.length) return;
    const prevIndex = currentSlide === 0 ? processedImageURLs.length - 1 : currentSlide - 1;
    onThumbClick(processedImageURLs[prevIndex], prevIndex);
  };

  /* ---------------- Simple click to view full image ---------------- */
  const handleImageClick = () => {
    // Only allow modal on desktop (screen width > 768px)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return; // Don't open modal on mobile
    }
    
    if (!isVideoActive && mainSrc) {
      setModalImageSrc(mainSrc);
      setShowImageModal(true);
    }
  };

  const handleVideoClick = () => {
    // Only allow modal on desktop (screen width > 768px)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return; // Don't open modal on mobile
    }
    
    if (isVideoActive && currentVideoUrl) {
      setModalImageSrc(null);
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageSrc(null);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal) return;

      if (e.key === 'Escape') closeImageModal();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevModalImage();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextModalImage();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageModal, modalImageSrc, currentVideoUrl]);

  const nextModalImage = () => {
    const allItems = processedImageURLs;
    if (allItems.length <= 1) return;

    let currentIndex = -1;
    if (modalImageSrc) currentIndex = allItems.findIndex((i) => i.type === 'image' && i.img === modalImageSrc);
    else if (currentVideoUrl) currentIndex = allItems.findIndex((i) => i.type === 'video' && i.video === currentVideoUrl);

    const nextIndex = (currentIndex + 1) % allItems.length;
    const nextItem = allItems[nextIndex];

    if (nextItem.type === 'video') {
      setCurrentVideoUrl(nextItem.video);
      setModalImageSrc(null);
    } else {
      setModalImageSrc(nextItem.img);
      setCurrentVideoUrl(null);
    }
  };

  const prevModalImage = () => {
    const allItems = processedImageURLs;
    if (allItems.length <= 1) return;

    let currentIndex = -1;
    if (modalImageSrc) currentIndex = allItems.findIndex((i) => i.type === 'image' && i.img === modalImageSrc);
    else if (currentVideoUrl) currentIndex = allItems.findIndex((i) => i.type === 'video' && i.video === currentVideoUrl);

    const prevIndex = currentIndex === 0 ? allItems.length - 1 : currentIndex - 1;
    const prevItem = allItems[prevIndex];

    if (prevItem.type === 'video') {
      setCurrentVideoUrl(prevItem.video);
      setModalImageSrc(null);
    } else {
      setModalImageSrc(prevItem.img);
      setCurrentVideoUrl(null);
    }
  };

  const mainUnoptimized = Boolean(mainSrc && (isCloudinaryUrl(mainSrc) || isDataUrl(mainSrc)));

  const onMainImageError = () => {
    if (mainSrc !== NO_IMG) setMainSrc(NO_IMG);
  };

  return (
    <div className="pdw-wrapper">
      {/* Desktop Thumbs */}
      <nav className="pdw-thumbs pdw-desktop-only">
        <div className="pdw-thumbs-inner">
          {processedImageURLs?.map((item, i) => {
            const altText =
              item.type === 'video'
                ? `${productName} video thumbnail`
                : `${productName} image ${i + 1}`;

            return item.type === 'video' ? (
              <button
                key={`v-${i}`}
                className={`pdw-thumb ${i === currentSlide ? 'is-active' : ''}`}
                onClick={() => onThumbClick(item, i)}
                type="button"
                aria-label="Play video"
                title="Play video"
              >
                <Image
                  src={item.img || '/assets/img/product/default-product-img.jpg'}
                  alt={altText}
                  width={80}
                  height={80}
                  className="pdw-thumb-img"
                  style={{ objectFit: 'cover' }}
                  unoptimized={Boolean(item.img && (isCloudinaryUrl(item.img) || isDataUrl(item.img)))}
                  loading="lazy"
                />
                <span className="pdw-thumb-play" aria-hidden>
                  <CgPlayButtonO />
                </span>
              </button>
            ) : (
              <button
                key={`i-${i}`}
                className={`pdw-thumb ${i === currentSlide ? 'is-active' : ''}`}
                onClick={() => onThumbClick(item, i)}
                type="button"
                title="View image"
              >
                <Image
                  src={item.img || '/assets/img/product/default-product-img.jpg'}
                  alt={altText}
                  width={80}
                  height={80}
                  className="pdw-thumb-img"
                  style={{ objectFit: 'cover' }}
                  unoptimized={Boolean(item.img && (isCloudinaryUrl(item.img) || isDataUrl(item.img)))}
                  loading="lazy"
                  onError={(e) => {
                    // If this is a collection image with fallback URLs, try them
                    if (item.source === 'collection' && item.fallbackUrls && item.fallbackUrls.length > 0) {
                      const currentSrc = e.currentTarget.src;
                      const currentIndex = item.fallbackUrls.findIndex(url => url === currentSrc);
                      const nextIndex = currentIndex + 1;
                      
                      if (nextIndex < item.fallbackUrls.length) {
                        e.currentTarget.src = item.fallbackUrls[nextIndex];
                        return;
                      }
                    }
                    // Final fallback
                    e.currentTarget.src = '/assets/img/product/default-product-img.jpg';
                  }}
                />
                {/* Visual indicator for collection images */}
                {item.source === 'collection' && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#4CAF50',
                    color: 'white',
                    fontSize: '8px',
                    padding: '1px 3px',
                    borderRadius: '2px',
                    fontWeight: 'bold'
                  }}>
                    COLLECTION
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main viewer - click to enlarge */}
      <div className="pdw-main">
        {/* Mobile Navigation Arrows */}
        <button className="pdw-nav-arrow pdw-nav-prev pdw-mobile-only" onClick={prevSlide} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <button className="pdw-nav-arrow pdw-nav-next pdw-mobile-only" onClick={nextSlide} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>

        <div
          className="pdw-main-inner"
          onClick={isVideoActive ? handleVideoClick : handleImageClick}
          style={{ cursor: 'pointer' }}
        >
          {isVideoActive && (currentVideoUrl || videoId) ? (
            currentVideoUrl && currentVideoUrl.includes('youtu') ? (
              <iframe
                src={(() => {
                  let embedUrl = currentVideoUrl;
                  if (embedUrl.includes('youtu.be/')) {
                    const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
                  } else if (embedUrl.includes('watch?v=')) {
                    const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
                  } else if (!embedUrl.includes('/embed/')) {
                    // If it's already an embed URL, use as is
                    // Otherwise try to extract video ID from any YouTube URL format
                    const match = embedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    if (match) {
                      embedUrl = `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&showinfo=0`;
                    }
                  } else if (embedUrl.includes('/embed/') && !embedUrl.includes('?')) {
                    // Add parameters to existing embed URL if no parameters exist
                    embedUrl += '?rel=0&modestbranding=1&showinfo=0';
                  } else if (embedUrl.includes('/embed/') && embedUrl.includes('?')) {
                    // Add parameters to existing embed URL with existing parameters
                    embedUrl += '&rel=0&modestbranding=1&showinfo=0';
                  }
                  return embedUrl;
                })()}
                className="pdw-video"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Product Video"
              />
            ) : (
              <video
                src={currentVideoUrl || videoId}
                controls
                autoPlay
                className="pdw-video"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )
          ) : (
            // ✅ FIX: Next/Image with width+height -> SEO tool won’t show “HTML - x -”
            <Image
              src={mainSrc || NO_IMG}
              alt={productName}
              width={imgWidth}
              height={imgHeight}
              sizes={`(max-width: 768px) 100vw, ${imgWidth}px`}
              className="pdw-main-img"
              style={{ objectFit: 'contain' }}
              unoptimized={mainUnoptimized}
              onError={onMainImageError}
              priority
            />
          )}

          {/* Click to enlarge hint */}
          {!isVideoActive && mainSrc && (
            <div className="pdw-enlarge-hint">
              <span>🔍 Click to enlarge</span>
            </div>
          )}

          <div className="tp-product-badge">
            {status === 'out-of-stock' && <span className="product-hot">out-stock</span>}
          </div>
        </div>
      </div>

      {/* Mobile Thumbnail Dots */}
      <div className="pdw-mobile-dots pdw-mobile-only">
        {processedImageURLs?.map((item, i) => {
          const altText =
            item.type === 'video'
              ? `${productName} video thumbnail`
              : `${productName} image ${i + 1}`;

          return (
            <button
              key={`dot-${i}`}
              className={`pdw-dot ${i === currentSlide ? 'is-active' : ''}`}
              onClick={() => onThumbClick(item, i)}
              type="button"
            >
              <Image
                src={item.img || '/assets/img/product/default-product-img.jpg'}
                alt={altText}
                width={60}
                height={60}
                className="pdw-dot-img"
                style={{ objectFit: 'contain' }}
                unoptimized={Boolean(item.img && (isCloudinaryUrl(item.img) || isDataUrl(item.img)))}
                loading="lazy"
              />
              {item.type === 'video' && (
                <span className="pdw-dot-play">
                  <CgPlayButtonO />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Media Modal */}
      {showImageModal && (
        <div className="pdw-modal-overlay" onClick={closeImageModal}>
          <div className="pdw-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="pdw-modal-close" onClick={closeImageModal} type="button">
              ×
            </button>

            {processedImageURLs.length > 1 && (
              <button className="pdw-modal-nav pdw-modal-prev" onClick={prevModalImage} type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
              </button>
            )}

            {processedImageURLs.length > 1 && (
              <button className="pdw-modal-nav pdw-modal-next" onClick={nextModalImage} type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>
            )}

            <div className="pdw-modal-media-container">
              {modalImageSrc ? (
                <img src={modalImageSrc} alt="Full size product image" className="pdw-modal-image" />
              ) : currentVideoUrl ? (
                currentVideoUrl.includes('youtu') ? (
                  <iframe
                    src={(() => {
                      let embedUrl = currentVideoUrl;
                      if (embedUrl.includes('youtu.be/')) {
                        const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
                      } else if (embedUrl.includes('watch?v=')) {
                        const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
                      } else if (!embedUrl.includes('/embed/')) {
                        const match = embedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                        if (match) {
                          embedUrl = `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&showinfo=0`;
                        }
                      } else if (embedUrl.includes('/embed/') && !embedUrl.includes('?')) {
                        // Add parameters to existing embed URL if no parameters exist
                        embedUrl += '?rel=0&modestbranding=1&showinfo=0';
                      } else if (embedUrl.includes('/embed/') && embedUrl.includes('?')) {
                        // Add parameters to existing embed URL with existing parameters
                        embedUrl += '&rel=0&modestbranding=1&showinfo=0';
                      }
                      return embedUrl;
                    })()}
                    className="pdw-modal-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Product Video"
                  />
                ) : (
                  <video src={currentVideoUrl} controls autoPlay className="pdw-modal-video" />
                )
              ) : null}
            </div>

            {processedImageURLs.length > 1 && (
              <div className="pdw-modal-counter">
                {(() => {
                  let currentIndex = -1;
                  if (modalImageSrc) {
                    currentIndex = processedImageURLs.findIndex(
                      (item) => item.type === 'image' && item.img === modalImageSrc
                    );
                  } else if (currentVideoUrl) {
                    currentIndex = processedImageURLs.findIndex(
                      (item) => item.type === 'video' && item.video === currentVideoUrl
                    );
                  }
                  return currentIndex >= 0 ? `${currentIndex + 1} / ${processedImageURLs.length}` : '1 / 1';
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- styles ---------- */}
      <style jsx>{`
        .pdw-wrapper {
          display: grid;
          grid-template-columns: 96px ${imgWidth}px;
          gap: 20px;
          align-items: start;
        }

        /* Desktop Thumbnails */
        .pdw-thumbs { width: 96px; }
        .pdw-thumbs-inner {
          display: flex; flex-direction: column; gap: 12px;
          max-height: ${Math.max(imgHeight + 100, 600)}px;
          overflow-y: auto; overflow-x: hidden; padding-right: 4px;
          scrollbar-width: thin;
        }

        .pdw-thumb {
          position: relative; width: 80px; height: 80px;
          padding: 0; border: 0; box-sizing: border-box;
          border-radius: 12px; overflow: hidden; background: #fff; cursor: pointer;
          transition: transform .12s ease, box-shadow .16s ease;
          flex: 0 0 auto; display: grid; place-items: center;
        }
        .pdw-thumb:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
        .pdw-thumb.is-active { box-shadow: inset 0 0 0 3px #3b82f6; }

        .pdw-thumb-img { width: 100%; height: 100%; object-fit: contain; display: block; border-radius: inherit; }

        .pdw-thumb-play {
          position: absolute; inset: 0; display: grid; place-items: center;
          color: #fff; font-size: 34px;
          background: linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,.05));
          pointer-events: none;
        }

        /* Main Image Container */
        .pdw-main {
          width: ${imgWidth}px; height: ${imgHeight}px;
          border-radius: 12px; overflow: hidden;
          background: #fff; border: 1px solid #e5e7eb;
          box-shadow: 0 8px 24px rgba(0,0,0,.06);
          position: relative;
        }
        .pdw-main-inner { 
          width: 100%; height: 100%; position: relative; display: grid; place-items: center;
          transition: transform 0.2s ease;
        }
        .pdw-main-inner:hover { transform: scale(1.02); }
        .pdw-video { background: #000; width: 100%; height: 100%; }

        /* ✅ ensure Next/Image fills container */
        .pdw-main :global(.pdw-main-img) {
          width: 100% !important;
          height: 100% !important;
        }

        /* Navigation Arrows (Mobile Only) */
        .pdw-nav-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,.95); border: none; border-radius: 50%;
          width: 50px; height: 50px; cursor: pointer; z-index: 10; display: none;
          box-shadow: 0 4px 16px rgba(0,0,0,.2);
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center;
          color: #333;
        }
        .pdw-nav-prev { left: 15px; }
        .pdw-nav-next { right: 15px; }

        /* Mobile Thumbnail Dots */
        .pdw-mobile-dots {
          display: none; justify-content: flex-start; gap: 8px; margin-top: 15px;
          padding: 0 20px; overflow-x: auto; padding-bottom: 5px;
          scrollbar-width: thin;
        }
        .pdw-dot {
          position: relative; width: 60px; height: 60px; flex-shrink: 0;
          padding: 0; border: 2px solid transparent; border-radius: 8px;
          overflow: hidden; background: #fff; cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdw-dot.is-active { border-color: #3b82f6; }
        .pdw-dot-img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .pdw-dot-play {
          position: absolute; inset: 0; display: grid; place-items: center;
          color: #fff; font-size: 20px;
          background: linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.1));
          pointer-events: none;
        }

        .pdw-enlarge-hint {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(0,0,0,.7); color: white; padding: 4px 8px;
          border-radius: 6px; font-size: 12px; opacity: 0;
          transition: opacity 0.2s ease; pointer-events: none;
        }
        .pdw-main-inner:hover .pdw-enlarge-hint { opacity: 1; }
        
        /* Desktop-only hover effect for clickable images */
        @media (min-width: 769px) {
          .pdw-main-inner:hover { 
            transform: scale(1.02); 
            cursor: pointer;
          }
          .pdw-main-inner::after {
            content: '🔍 Click to enlarge';
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,.8);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
          }
          .pdw-main-inner:hover::after {
            opacity: 1;
          }
        }

        .tp-product-badge { position: absolute; left: 10px; top: 10px; }
        .product-hot { display: inline-block; background: #ef4444; color: #fff; font-size: 12px; padding: 4px 8px; border-radius: 6px; }

        .pdw-desktop-only { display: block; }
        .pdw-mobile-only { display: none; }

        /* Modal Styles */
        .pdw-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,.8); display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 60px 20px; cursor: pointer; /* Added top/bottom padding */
        }
        .pdw-modal-content {
          position: relative; 
          width: 90vw; height: calc(100vh - 120px); /* Adjust height to account for padding */
          max-width: 1200px; max-height: 800px;
          background: white; border-radius: 12px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.3); cursor: default;
          display: flex; align-items: center; justify-content: center;
        }
        .pdw-modal-close {
          position: absolute; top: 15px; right: 15px; z-index: 10;
          background: rgba(0,0,0,.7); color: white; border: none;
          width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
          font-size: 24px; display: flex; align-items: center; justify-content: center;
        }

        .pdw-modal-nav {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          background: rgba(0,0,0,.7); color: white; border: none;
          width: 50px; height: 50px; border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .pdw-modal-prev { left: 20px; }
        .pdw-modal-next { right: 20px; }

        .pdw-modal-counter {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          background: rgba(0,0,0,.7); color: white; padding: 8px 16px;
          border-radius: 20px; font-size: 14px; font-weight: 500;
        }

        .pdw-modal-media-container {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: #f8f9fa;
        }

        .pdw-modal-image {
          max-width: 100%; max-height: 100%;
          object-fit: contain; object-position: center;
          display: block;
        }

        .pdw-modal-video {
          width: 100%; height: 100%;
          max-width: 100%; max-height: 100%;
          object-fit: contain;
          border: none;
        }

        @media (max-width: 768px) {
          .pdw-wrapper { display: block; max-width: 100%; margin: 0 auto; padding: 0 15px; }
          .pdw-desktop-only { display: none; }
          .pdw-mobile-only { display: block; }

          .pdw-main {
            width: 100%;
            height: 400px;
            max-width: 500px;
            margin: 0 auto;
            border-radius: 16px;
          }

          .pdw-nav-arrow { display: flex !important; }
          .pdw-mobile-dots { display: flex; }
          .pdw-enlarge-hint { display: none; }
          
          /* Hide modal completely on mobile */
          .pdw-modal-overlay { display: none !important; }
          
          /* Remove pointer cursor on mobile since modal won't open */
          .pdw-main-inner { cursor: default !important; }
        }

        @media (max-width: 480px) {
          .pdw-main { height: 350px; }
          .pdw-nav-arrow { width: 40px; height: 40px; }
          .pdw-dot { width: 50px; height: 50px; }
        }
      `}</style>
    </div>
  );
};

export default DetailsThumbWrapper;
