import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import WishlistArea from "@/components/cart-wishlist/wishlist-area";

export const metadata = {
  title: "Shofy - Wishlist Page",
};

// Force SSR for wishlist to avoid stale cached data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default function WishlistPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <h1 style={{position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden'}}>Wishlist - Your Saved Products</h1>
      <WishlistArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
