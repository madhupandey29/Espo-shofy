'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

// Sample product data from the user's request
const sampleProductData = {
  "_id": "6931813c8bbfc1c1ec17a641",
  "name": "Silky Denim 5.5 ozs",
  "image3": "https://res.cloudinary.com/doh86kmu6/image/upload/v1765780364/denim-fabrics/silky-denim-5-1765780508707.jpg",
  "image1": "https://res.cloudinary.com/doh86kmu6/image/upload/v1765605103/denim-fabrics/silky-denim-5-1765605102039.jpg",
  "image2": "https://res.cloudinary.com/doh86kmu6/image/upload/v1764852027/denim-fabrics/silky-denim-5-1764852026129.jpg",
  "video": "",
  "videourl": "https://youtu.be/5A8clDVutp8",
  "videoThumbnail": "",
  "altimg1": "30 x 150 Cotton Poly Denim Fabric",
  "altimg2": "30 x 150 Cotton Poly Denim Fabric Wash Effects",
  "videoalt": "30 x 150 Cotton Poly Denim Fabric Video",
  "groupcode": {
    "_id": "68c51a581543a9c1ecbec2ae",
    "name": "Nokia"
  }
};

// Sample group code data from the user's request
const sampleGroupCodeData = {
  "_id": "68c51a581543a9c1ecbec2ae",
  "name": "Nokia",
  "altimg": "img12",
  "altvideo": "video1",
  "video": "",
  "img": "https://res.cloudinary.com/doh86kmu6/image/upload/v1758520812/groupcode/nokia-img-1758520876619.avif",
  "videoalt": "yt link",
  "videourl": "https://youtu.be/-4MdNsfcNug?si=5F9K2AgXth1plIh1"
};

const SimpleMediaViewer = ({ productData, groupCodeData }) => {
  // Extract all media items
  const allMediaItems = useMemo(() => {
    const items = [];
    
    // Log input data
    console.log('=== SimpleMediaViewer Input ===');
    console.log('Product data:', productData);
    console.log('Group code data:', groupCodeData);
    
    // Product images
    if (productData?.img) {
      items.push({ 
        type: 'image', 
        url: productData.img, 
        source: 'Product Primary Image' 
      });
      console.log('Added Product Primary Image:', productData.img);
    }
    
    if (productData?.image1) {
      items.push({ 
        type: 'image', 
        url: productData.image1, 
        source: 'Product Image 1' 
      });
      console.log('Added Product Image 1:', productData.image1);
    }
    
    if (productData?.image2) {
      items.push({ 
        type: 'image', 
        url: productData.image2, 
        source: 'Product Image 2' 
      });
      console.log('Added Product Image 2:', productData.image2);
    }
    
    if (productData?.image3) {
      items.push({ 
        type: 'image', 
        url: productData.image3, 
        source: 'Product Image 3' 
      });
      console.log('Added Product Image 3:', productData.image3);
    }
    
    // Product video
    const productVideoUrl = productData?.videourl || productData?.video;
    if (productVideoUrl) {
      items.push({ 
        type: 'video', 
        url: productVideoUrl, 
        thumbnail: productData?.videoThumbnail || productData?.image1 || productData?.img,
        source: 'Product Video' 
      });
      console.log('Added Product Video:', productVideoUrl);
    }
    
    // Group code image
    if (groupCodeData?.img) {
      items.push({ 
        type: 'image', 
        url: groupCodeData.img, 
        source: 'Group Code Image' 
      });
      console.log('Added Group Code Image:', groupCodeData.img);
    }
    
    // Group code video
    const groupCodeVideoUrl = groupCodeData?.videourl || groupCodeData?.video;
    if (groupCodeVideoUrl) {
      items.push({ 
        type: 'video', 
        url: groupCodeVideoUrl, 
        thumbnail: groupCodeData?.videoThumbnail || groupCodeData?.altimg || groupCodeData?.img,
        source: 'Group Code Video' 
      });
      console.log('Added Group Code Video:', groupCodeVideoUrl);
    }
    
    console.log('=== SimpleMediaViewer Result ===');
    console.log('Total media items collected:', items.length);
    console.log('All media items:', items);
    return items;
  }, [productData, groupCodeData]);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = allMediaItems[activeIndex] || allMediaItems[0];
  
  if (allMediaItems.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No media items available
      </div>
    );
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Main display area */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '500px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #dee2e6'
      }}>
        {activeItem?.type === 'video' ? (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#000'
          }}>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <p>Video: {activeItem.url}</p>
              <p>(Video player would appear here)</p>
            </div>
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <img
              src={activeItem?.url || '/assets/img/product/default-product-img.jpg'}
              alt="Product media"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {allMediaItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              width: '80px',
              height: '80px',
              position: 'relative',
              cursor: 'pointer',
              border: activeIndex === index ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f0f0f0'
            }}>
              {item.type === 'video' ? (
                <div style={{ textAlign: 'center' }}>
                  <div>▶️</div>
                  <div style={{ fontSize: '10px' }}>Video</div>
                </div>
              ) : (
                <img
                  src={item.url || '/assets/img/product/default-product-img.jpg'}
                  alt={`Thumbnail ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '10px',
              textAlign: 'center',
              padding: '2px'
            }}>
              {item.source}
            </div>
          </div>
        ))}
      </div>
      
      {/* Info panel */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h4>Media Information</h4>
        <p><strong>Total items:</strong> {allMediaItems.length}</p>
        <p><strong>Active item:</strong> {activeItem?.source} #{activeIndex + 1}</p>
        <p><strong>URL:</strong> {activeItem?.url}</p>
      </div>
    </div>
  );
};

const TestGroupCodeIntegration = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    // Show debug info by default
    setShowDebug(true);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Testing Group Code Integration</h2>
      <p>This component tests the integration of product images/videos with group code images/videos.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>
      
      {showDebug && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '4px', 
          padding: '15px', 
          margin: '20px 0'
        }}>
          <h3>Sample Data Debug Info:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4>Product Data:</h4>
              <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(sampleProductData, null, 2)}
              </pre>
            </div>
            <div>
              <h4>Group Code Data:</h4>
              <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(sampleGroupCodeData, null, 2)}
              </pre>
            </div>
          </div>
          
          <h4>Expected Media Items:</h4>
          <ul>
            <li>Product Image 1: {sampleProductData.image1}</li>
            <li>Product Image 2: {sampleProductData.image2}</li>
            <li>Product Image 3: {sampleProductData.image3}</li>
            <li>Product Video: {sampleProductData.videourl}</li>
            <li>Group Code Image: {sampleGroupCodeData.img}</li>
            <li>Group Code Video: {sampleGroupCodeData.videourl}</li>
          </ul>
          
          <p><strong>Total Expected: 6 media items</strong></p>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Media Gallery Preview:</h3>
        <SimpleMediaViewer 
          productData={sampleProductData} 
          groupCodeData={sampleGroupCodeData} 
        />
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Go to the Console tab</li>
          <li>Look for log messages that show how many media items are being processed</li>
          <li>You should see logs like:
            <ul>
              <li>"Added Product Image 1: [URL]"</li>
              <li>"Added Product Image 2: [URL]"</li>
              <li>"Added Product Image 3: [URL]"</li>
              <li>"Added Group Code Image: [URL]"</li>
              <li>"Total media items collected: 6"</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TestGroupCodeIntegration;