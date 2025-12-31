import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import OrderArea from "@/components/order/order-area";

export const metadata = {
  title: "Amrita Global Enterprises - Order Details",
};

// Force SSR for order details
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default function OrderPage({ params, searchParams }) {
  // Route folder is [id], so params.id is the order id
  const orderId = params?.id;
  const userId = searchParams?.userId ?? null; // optional, we also resolve from localStorage in OrderArea

  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <OrderArea orderId={orderId} userId={userId} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
