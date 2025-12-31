// app/page.jsx
import HomePageTwoClient from "./HomePageTwoClient";

const stripTrailingSlash = (s = "") => String(s || "").replace(/\/+$/, "");
const pick = (...v) =>
  v.find((x) => x !== undefined && x !== null && String(x).trim() !== "");

const API_BASE = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || "");
const SITE_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "");

// ✅ endpoint ONLY
const TOPIC_SEO_ENDPOINT = "/topicpage-seo";

// ✅ build URL from env (never from API canonical_url)
const pageUrl = (path = "/") => {
  if (!SITE_URL) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const sanitizeOgType = (t) => {
  const v = String(t || "").toLowerCase();
  if (v === "article") return "article";
  return "website";
};

async function getTopicSeoData() {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}${TOPIC_SEO_ENDPOINT}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

export async function generateMetadata() {
  const data = await getTopicSeoData();

  // ✅ Direct slug checks only
  let seo = null;
  for (const item of data) {
    if (item?.slug === "home" || item?.slug === "Home") {
      seo = item;
      break;
    }
  }

  // ✅ canonical always from env
  const canonical = pageUrl("/");

  // fallback if backend not ready
  if (!seo) {
    return {
      alternates: { canonical },
      openGraph: { url: canonical, type: "website" },
    };
  }

  const title = pick(seo.meta_title, seo.name);
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
      title, // meta_title reused
      description, // meta_description reused
      type: sanitizeOgType(seo.ogType),
      url: canonical, // ✅ from env
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

export default function Page() {
  return <HomePageTwoClient />;
}
