'use client';
import React from 'react';
import Image from 'next/image';
import signature from '@assets/img/blog/signature/signature.png';
import { useGetAuthorsQuery } from '@/redux/features/authorApi';

const BlogSidebar = () => {
  const { data: authors, isLoading, error } = useGetAuthorsQuery();
  
  // Get the first author or fallback to static content
  const author = authors?.[0];

  return (
    <>
      <div className="tp-sidebar-wrapper tp-sidebar-ml--24">
        {/* About */}
        <div className="tp-sidebar-widget mb-35">
          <h3 className="tp-sidebar-widget-title">About Me</h3>
          <div className="tp-sidebar-widget-content">
            <div className="tp-sidebar-about">
             <div className="tp-sidebar-about-thumb mb-25">
  <a href="#" className="tp-profile-avatar tp-profile-avatar--oval">
    <Image
      src={author?.authorimage} // fallback (change path if needed)
      alt={author?.name || "Rajesh Goyal"}
      fill
      sizes="200px"
      className="tp-profile-avatar__img"
    />
  </a>
</div>

              <div className="tp-sidebar-about-content">
                {isLoading ? (
                  <div style={{ textAlign: "center", color: "#666" }}>
                    Loading author information...
                  </div>
                ) : error || !author ? (
                  // Fallback to static content
                  <>
                    <h3 className="tp-sidebar-about-title">
                      <a href="#">Rajesh Goyal</a>
                    </h3>
                    <span className="tp-sidebar-about-designation">
                      Founder & Managing Director, Amrita Global Enterprises
                    </span>
                    <p>
                      Leading <strong>Amrita Global Enterprises</strong>, Rajesh
                      Goyal has built a legacy of trust and innovation in premium
                      textile manufacturing. With a passion for quality fabrics and
                      sustainable design, he continues to redefine modern fabric
                      sourcing for global apparel brands.
                    </p>
                  </>
                ) : (
                  // Dynamic content from API
                  <>
                    <h3 className="tp-sidebar-about-title">
                      <a href="#">{author.name}</a>
                    </h3>
                    <span className="tp-sidebar-about-designation">
                      {author.designation}
                    </span>
                    <p>
                      {author.description}
                    </p>
                  </>
                )}
                <div className="tp-sidebar-about-signature">
                  <Image src={signature} alt="signature" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="tp-sidebar-widget mb-35">
          <h3 className="tp-sidebar-widget-title">Popular Tags</h3>
          <div className="tp-sidebar-widget-content tagcloud">
            <a href="#">Textiles</a>
            <a href="#">Sustainability</a>
            <a href="#">Fabric Trends</a>
            <a href="#">Design</a>
            <a href="#">Innovation</a>
            <a href="#">AmritaGlobal</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogSidebar;
