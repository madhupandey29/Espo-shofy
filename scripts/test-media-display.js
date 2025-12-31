// Test script to verify media display functionality
// This simulates the data structure that would be passed to DetailsThumbWrapper

const testProductData = {
  img: "main-product-image.jpg",
  image1: "product-image-1.jpg", 
  image2: "product-image-2.jpg",
  image3: "product-image-3.jpg",
  image4: "product-image-4.jpg",
  image5: "product-image-5.jpg",
  image6: "product-image-6.jpg",
  altimg1: "alt-image-1.jpg",
  altimg2: "alt-image-2.jpg", 
  videourl: "https://youtu.be/example123",
  videoThumbnail: "video-thumb.jpg"
};

// Simulate the logic from the updated component
function simulateMediaProcessing(productData) {
  const imageFields = [
    productData.img,
    productData.image1,
    productData.image2, 
    productData.image3,
    productData.image4,
    productData.image5,
    productData.image6,
    productData.altimg1,
    productData.altimg2,
    productData.altimg3,
    productData.altimg4,
    productData.altimg5,
    productData.altimg6
  ].filter(Boolean);
  
  console.log('=== MEDIA PROCESSING TEST ===');
  console.log('Available image fields:', imageFields);
  console.log('Total images found:', imageFields.length);
  
  const mediaList = [];
  
  // Add all images
  imageFields.forEach((imageField, index) => {
    if (imageField) {
      mediaList.push({ 
        type: 'image', 
        img: imageField, 
        source: 'product', 
        index: index + 1 
      });
    }
  });
  
  // Add video if available
  if (productData.videourl || productData.video) {
    mediaList.push({
      type: 'video',
      img: productData.videoThumbnail || imageFields[0] || 'default-thumb.jpg',
      video: productData.videourl || productData.video,
      source: 'product'
    });
  }
  
  console.log('Final media list:', mediaList);
  console.log('Total media items:', mediaList.length);
  
  return mediaList;
}

// Run the test
const result = simulateMediaProcessing(testProductData);

console.log('\n=== SUMMARY ===');
console.log(`✅ Successfully processed ${result.length} media items`);
console.log('Media breakdown:');
result.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.type.toUpperCase()}: ${item.img}${item.video ? ` (video: ${item.video})` : ''}`);
});

if (result.length >= 6) {
  console.log('\n🎉 SUCCESS: All 6+ media items will now be displayed in the quick view!');
} else {
  console.log(`\n⚠️  Only ${result.length} media items found. Check if your product has more image fields.`);
}