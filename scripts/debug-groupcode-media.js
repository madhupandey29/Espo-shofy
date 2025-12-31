// Debug script to test group code media processing
console.log('=== GROUP CODE MEDIA DEBUG ===');

// Simulate the group code data structure based on your API
const mockGroupCodeData = {
  _id: "68c51a581543a9c1ecbec2ae",
  name: "Nokia",
  img: "group-image.jpg",
  altimg: "img12",
  video: "",
  videourl: "https://youtu.be/5A8clDVutp8",
  altvideo: "video1",
  videoalt: "30 x 150 Cotton Poly Denim Fabric Video"
};

const mockProductData = {
  image1: "product-image-1.jpg",
  image2: "product-image-2.jpg", 
  image3: "", // blank as you mentioned
  videourl: "https://youtu.be/product123",
  videoThumbnail: "product-video-thumb.jpg"
};

// Simulate the processImageUrl function
function processImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://test.amrita-fashions.com/shopy/uploads/${encodeURIComponent(url)}`;
}

// Simulate the getYouTubeThumbnail function
function getYouTubeThumbnail(url) {
  if (!url) return null;
  let videoId = null;
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

// Test primary thumbs (product media)
console.log('\n1. TESTING PRIMARY THUMBS (Product Media):');
const primaryThumbs = [];

// Add product images
const imageFields = [
  mockProductData.image1,
  mockProductData.image2,
  mockProductData.image3
].filter(Boolean);

console.log('Available product images:', imageFields);

imageFields.forEach((imageField, index) => {
  if (imageField) {
    const imgUrl = processImageUrl(imageField);
    if (imgUrl) {
      primaryThumbs.push({ type: 'image', img: imgUrl, source: 'product', index });
      console.log(`✅ Added product image ${index + 1}:`, imgUrl);
    }
  }
});

// Add product video
const productVideoUrl = mockProductData.videourl;
if (productVideoUrl) {
  const videoUrl = productVideoUrl;
  const poster = processImageUrl(mockProductData.videoThumbnail) ||
                getYouTubeThumbnail(productVideoUrl) ||
                '/assets/img/product/default-product-img.jpg';
  
  primaryThumbs.push({ type: 'video', img: poster, video: videoUrl, source: 'product' });
  console.log('✅ Added Product Video:', videoUrl);
}

console.log('Primary thumbs result:', primaryThumbs);

// Test group code media
console.log('\n2. TESTING GROUP CODE MEDIA:');
const groupCodeMedia = [];

console.log('Group code data received:', mockGroupCodeData);

// Add group code image
if (mockGroupCodeData.img) {
  const imageUrl = processImageUrl(mockGroupCodeData.img);
  if (imageUrl) {
    groupCodeMedia.push({ type: 'image', img: imageUrl, source: 'groupcode' });
    console.log('✅ Added Group Code Image:', imageUrl);
  }
} else {
  console.log('❌ No group code image found');
}

// Add group code video
const groupVideoUrl = mockGroupCodeData.videourl || mockGroupCodeData.video;
console.log('Group code video URL check:', { 
  videourl: mockGroupCodeData.videourl, 
  video: mockGroupCodeData.video, 
  groupVideoUrl 
});

if (groupVideoUrl) {
  const videoUrl = groupVideoUrl;
  const poster = getYouTubeThumbnail(groupVideoUrl) ||
                 processImageUrl(mockGroupCodeData.img) || 
                 processImageUrl(mockGroupCodeData.altimg) ||
                 '/assets/img/product/default-product-img.jpg';
  
  console.log('Group code video details:', { 
    videoUrl, 
    poster, 
    youtubeThumb: getYouTubeThumbnail(groupVideoUrl),
    groupImg: processImageUrl(mockGroupCodeData.img)
  });
  
  if (videoUrl) {
    groupCodeMedia.push({ type: 'video', img: poster, video: videoUrl, source: 'groupcode' });
    console.log('✅ Added Group Code Video:', videoUrl);
  }
} else {
  console.log('❌ No group code video found');
}

console.log('Group code media result:', groupCodeMedia);

// Test final combination
console.log('\n3. TESTING FINAL MEDIA COMBINATION:');
const finalMedia = [
  ...primaryThumbs,
  ...groupCodeMedia
];

console.log('Final media items:', finalMedia.length);
console.log('Final media list:', finalMedia);

console.log('\n4. EXPECTED RESULT:');
console.log(`Total media items: ${finalMedia.length}`);
console.log('Breakdown:');
finalMedia.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.type.toUpperCase()} (${item.source}): ${item.img}${item.video ? ` [video: ${item.video}]` : ''}`);
});

if (finalMedia.length >= 4) {
  console.log('\n🎉 SUCCESS: Should show 4+ media items (2 product images + 1 product video + 1 groupcode image + 1 groupcode video)');
} else {
  console.log(`\n⚠️  Only ${finalMedia.length} media items found. Expected at least 4.`);
}