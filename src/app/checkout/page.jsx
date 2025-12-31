import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import CheckoutArea from "@/components/checkout/checkout-area";

export const metadata = {
  title: "Shofy - Checkout Page",
};

// Force SSR for fresh checkout calculations and validations
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default function CheckoutPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      {/* <CommonBreadcrumb title="Checkout" subtitle="Checkout" bg_clr={true} /> */}
      <CheckoutArea/>
      <Footer style_2={true} />
    </Wrapper>
  );
}
