import { useState } from 'react';
import Link from 'next/link';

const OffCanvas = ({ isOffCanvasOpen, setIsCanvasOpen = () => {} }) => {
  const handleCloseCanvas = () => {
    setIsCanvasOpen(false);
  };

  // Main menu items
  const mainMenuItems = [
    { title: "Home", link: "/" },
    { title: "Products", link: "/shop" },
    { title: "Blog", link: "/blog-grid" },
    { title: "Contact", link: "/contact" },
    { title: "Wishlist", link: "/wishlist" }
  ];

  // Clean close icon
  const CloseIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M15 5L5 15M5 5L15 15" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // CSS Styles - No hover effects
  const styles = `
    .offcanvas__area {
      position: fixed;
      top: 0;
      right: -100%;
      width: 320px;
      max-width: 85vw;
      height: 100vh;
      background: #ffffff;
      transition: right 0.3s ease;
      z-index: 10000;
      box-shadow: -4px 0 20px rgba(15, 34, 53, 0.1);
      border-left: 1px solid #E6ECF2;
    }
    .offcanvas__area.offcanvas-opened {
      right: 0;
    }
    .offcanvas__wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .offcanvas__content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
    .offcanvas__header {
      padding: 25px;
      border-bottom: 1px solid #F1F5F9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
    }
    .offcanvas__close-btn {
      background: #F7F9FC;
      border: 1px solid #E6ECF2;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: #475569;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-text {
      font-family: 'Poppins', 'Jost', system-ui, sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #2C4C97;
    }
    .mobile-menu-list {
      list-style: none;
      padding: 30px 0;
      margin: 0;
      background: #ffffff;
    }
    .mobile-menu-item {
      margin: 0;
    }
    .mobile-menu-link {
      display: flex;
      align-items: center;
      padding: 16px 25px;
      color: #0F2235;
      text-decoration: none;
      font-family: 'Hind', 'Jost', system-ui, sans-serif;
      font-weight: 500;
      font-size: 16px;
      background: #ffffff;
      border-left: 3px solid transparent;
    }
    .mobile-menu-item:not(:last-child) .mobile-menu-link {
      border-bottom: 1px solid #F7F9FC;
    }
    .body-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 34, 53, 0.5);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    .body-overlay.opened {
      opacity: 1;
      visibility: visible;
    }
    /* Enhanced scrollbar */
    .offcanvas__content::-webkit-scrollbar {
      width: 3px;
    }
    .offcanvas__content::-webkit-scrollbar-track {
      background: #F7F9FC;
    }
    .offcanvas__content::-webkit-scrollbar-thumb {
      background: #E6ECF2;
    }
    /* Mobile optimizations */
    @media (max-width: 576px) {
      .offcanvas__area {
        width: 280px;
      }
      .offcanvas__header {
        padding: 20px;
      }
      .mobile-menu-list {
        padding: 25px 0;
      }
      .mobile-menu-link {
        padding: 15px 20px;
      }
    }
    @media (max-width: 1024px) {
      .mobile-menu-link {
        min-height: 52px;
        display: flex;
        align-items: center;
      }
    }
  `;

  return (
    <>
      <style jsx>{styles}</style>
      
      <div className={`offcanvas__area ${isOffCanvasOpen ? 'offcanvas-opened' : ''}`}>
        <div className="offcanvas__wrapper">
          <div className="offcanvas__content">
            {/* Header */}
            <div className="offcanvas__header">
              <span className="brand-text">AGE</span>
              <button 
                onClick={handleCloseCanvas} 
                className="offcanvas__close-btn"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Navigation - No hover effects */}
            <nav className="mobile-menu-nav">
              <ul className="mobile-menu-list">
                {mainMenuItems.map((menu) => (
                  <li key={menu.link} className="mobile-menu-item">
                    <Link 
                      href={menu.link} 
                      className="mobile-menu-link"
                      onClick={handleCloseCanvas}
                    >
                      {menu.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Backdrop Overlay */}
      <div 
        onClick={handleCloseCanvas} 
        className={`body-overlay ${isOffCanvasOpen ? 'opened' : ''}`}
        aria-hidden="true"
      />
    </>
  );
};

export default OffCanvas;
