// app/shop/page.jsx
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import ShopArea from "@/components/shop/shop-area";

/* ---------------------------------------------
   Incremental Static Regeneration (ISR)
---------------------------------------------- */
export const revalidate = 120;

/* ---------------------------------------------
   Helpers (plain JS, no TS types)
---------------------------------------------- */
function buildApiHeaders() {
  const headers = { "Content-Type": "application/json" };
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  if (apiKey) headers["x-api-key"] = apiKey;
  if (adminEmail) headers["x-admin-email"] = adminEmail;
  return headers;
}

function trimEndSlash(s = "") {
  return String(s || "").replace(/\/+$/, "");
}

const pick = (...v) =>
  v.find((x) => x !== undefined && x !== null && String(x).trim() !== "");

const API_BASE = trimEndSlash(process.env.NEXT_PUBLIC_API_BASE_URL || "");
const SITE_URL = trimEndSlash(process.env.NEXT_PUBLIC_SITE_URL || "");

// ✅ endpoint ONLY
const TOPIC_SEO_ENDPOINT = "/topicpage-seo";

// ✅ build URL from env (never from API canonical_url)
const pageUrl = (path = "/") => {
  if (!SITE_URL) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

function sanitizeOgType(t) {
  const v = String(t || "").toLowerCase();
  if (v === "article") return "article";
  return "website";
}

async function getTopicSeoData() {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}${TOPIC_SEO_ENDPOINT}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/* ---------------------------------------------
   Metadata (Topic Page SEO)
---------------------------------------------- */
export async function generateMetadata() {
  const data = await getTopicSeoData();

  // ✅ direct checks only (handles "product" vs "Product")
  let seo = null;
  for (const item of data) {
    if (item?.slug === "product" || item?.slug === "Product") {
      seo = item;
      break;
    }
  }

  // ✅ canonical ALWAYS from env + /shop
  const canonical = pageUrl("/shop");

  // fallback if backend hasn't added this slug yet
  if (!seo) {
    return {
      title: "Shofy - Shop Page",
      alternates: { canonical },
      openGraph: { url: canonical, type: "website" },
    };
  }

  const title = pick(seo.meta_title, seo.name, "Shofy - Shop Page");
  const description = pick(seo.meta_description, seo.excerpt);

  // OG images: if API gives relative, convert using SITE_URL
  const ogImagesRaw = seo?.openGraph?.images;
  const ogImages =
    Array.isArray(ogImagesRaw) && ogImagesRaw.length
      ? ogImagesRaw
          .map((img) => {
            if (!img) return null;

            if (typeof img === "string") {
              const url = img.startsWith("http") ? img : pageUrl(img);
              return { url };
            }

            if (typeof img === "object") {
              const src = img.url || img.src;
              if (!src) return null;
              const url = String(src).startsWith("http") ? src : pageUrl(src);
              return { url, alt: img.alt || undefined };
            }

            return null;
          })
          .filter(Boolean)
      : undefined;

  return {
    title,
    description,
    keywords: seo.keywords || undefined,
    alternates: { canonical },

    openGraph: {
      title,
      description,
      type: sanitizeOgType(seo.ogType),
      url: canonical, // ✅ from env + /shop
      images: ogImages,
    },

    twitter: {
      card: ogImages?.length ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages?.length ? ogImages.map((i) => i.url) : undefined,
    },
  };
}

/**
 * Fetch products on the server (SSR).
 * Adjust the endpoint if your API differs.
 */
async function fetchProductsSSR() {
  const RAW_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000/landing";
  const API_BASE2 = trimEndSlash(RAW_BASE);

  const candidates = [
    `${API_BASE2}/products?limit=24`,
    `${API_BASE2}/product?limit=24`,
    `${API_BASE2}/catalog/products?limit=24`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: buildApiHeaders(),
        cache: "force-cache",
        next: { revalidate },
      });
      if (!res.ok) continue;

      const payload = await res.json();
      const data =
        (Array.isArray(payload?.data) && payload.data) ||
        (Array.isArray(payload) && payload) ||
        (Array.isArray(payload?.data?.items) && payload.data.items) ||
        [];

      return Array.isArray(data) ? data : [];
    } catch {
      // try next candidate
    }
  }

  return [];
}

/* ---------------------------------------------
   Page (Server Component)
---------------------------------------------- */
export default async function ShopPage() {
  const initialProducts = await fetchProductsSSR();

  return (
    <Wrapper>
      <HeaderTwo style_2 />

      {/* ✅ Hidden H1 for SEO */}
      <h1
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        Shop - Browse All Products
      </h1>

      <div className="shop-page-spacing">
        <ShopArea initialProducts={initialProducts} />
      </div>

      <Footer primary_style />
    </Wrapper>
  );
}
