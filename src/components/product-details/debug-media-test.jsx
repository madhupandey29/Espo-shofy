'use client';

import React, { useMemo } from 'react';
import DetailsThumbWrapper from './details-thumb-wrapper';

// Sample product data matching your API response
const sampleProductData = {
  "_id": "6931813c8bbfc1c1ec17a641",
  "name": "Silky Denim 5.5 ozs",
  "img": "https://res.cloudinary.com/doh86kmu6/image/upload/v1765605103/denim-fabrics/silky-denim-5-1765605102039.jpg",
  "image1": "https://res.cloudinary.com/doh86kmu6/image/upload/v1765605103/denim-fabrics/silky-denim-5-1765605102039.jpg",
  "image2": "https://res.cloudinary.com/doh86kmu6/image/upload/v1764852027/denim-fabrics/silky-denim-5-1764852026129.jpg",
  "image3": "https://res.cloudinary.com/doh86kmu6/image/upload/v1765780364/denim-fabrics/silky-denim-5-1765780508707.jpg",
  "videourl": "https://youtu.be/5A8clDVutp8",
  "videoThumbnail": "",
  "groupcode": {
    "_id": "68c51a581543a9c1ecbec2ae",
    "name": "Nokia"
  }
};

// Sample group code data matching your API response
const sampleGroupCodeData = {
  "_id": "68c51a581543a9c1ecbec2ae",
  "name": "Nokia",
  "img": "https://res.cloudinary.com/doh86kmu6/image/upload/v1758520812/groupcode/nokia-img-1758520876619.avif",
  "videourl": "https://youtu.be/-4MdNsfcNug?si=5F9K2AgXth1plIh1",
  "videoThumbnail": ""
};

const DebugMediaTest = () => {
  // Simulate the props that would be passed to DetailsThumbWrapper
  const img = sampleProductData?.img || null;
  const image1 = sampleProductData?.image1 || null;
  const image2 = sampleProductData?.image2 || null;
  const image3 = sampleProductData?.image3 || null;
  const videourl = sampleProductData?.videourl || null;
  const videoThumbnail = sampleProductData?.videoThumbnail || null;
  
  console.log('=== Debug Media Test Props ===');
  console.log('img:', img);
  console.log('image1:', image1);
  console.log('image2:', image2);
  console.log('image3:', image3);
  console.log('videourl:', videourl);
  console.log('videoThumbnail:', videoThumbnail);
  console.log('groupCodeData:', sampleGroupCodeData);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Debug Media Test</h2>
      <p>This component tests the DetailsThumbWrapper with sample data to verify all media items are displayed.</p>
      
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Expected Media Items (6 total):</h3>
        <ul>
          <li>✅ Product Image 1: {sampleProductData.image1}</li>
          <li>✅ Product Image 2: {sampleProductData.image2}</li>
          <li>✅ Product Image 3: {sampleProductData.image3}</li>
          <li>✅ Product Video: {sampleProductData.videourl}</li>
          <li>✅ Group Code Image: {sampleGroupCodeData.img}</li>
          <li>✅ Group Code Video: {sampleGroupCodeData.videourl}</li>
        </ul>
      </div>
      
      <div style={{ margin: '30px 0' }}>
        <h3>Media Gallery:</h3>
        <DetailsThumbWrapper
          // Product images
          img={img}
          image1={image1}
          image2={image2}
          image3={image3}
          
          // Product video
          videourl={videourl}
          videoThumbnail={videoThumbnail}
          
          // API data (pass the full product object)
          apiImages={sampleProductData}
          
          // Group code data
          groupCodeData={sampleGroupCodeData}
          
          // Other required props
          imgWidth={580}
          imgHeight={670}
          zoomPaneHeight={670}
        />
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>Debugging Instructions:</h3>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Go to the Console tab</li>
          <li>Look for log messages that show how many media items are being processed</li>
          <li>You should see logs like:
            <ul>
              <li>"Added Product Image 1: [URL]"</li>
              <li>"Added Product Image 2: [URL]"</li>
              <li>"Added Product Image 3: [URL]"</li>
              <li>"Added Product Video: [URL]"</li>
              <li>"Added Group Code Image: [URL]"</li>
              <li>"Added Group Code Video: [URL]"</li>
              <li>"Total media items collected: 6"</li>
            </ul>
          </li>
          <li>If you see 6 items collected, but only 2 thumbnails showing, there may be a CSS/layout issue</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugMediaTest;