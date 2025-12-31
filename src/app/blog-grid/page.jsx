import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import SectionTitle from "@/components/blog/blog-grid/section-title";
import BlogGridArea from "@/components/blog/blog-grid/blog-grid-area";
import Footer from "@/layout/footers/footer";

/* -----------------------------
  helpers
----------------------------- */
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

/* -----------------------------
  Metadata (Topic Page SEO)
----------------------------- */
export async function generateMetadata() {
  const data = await getTopicSeoData();

  // ✅ direct checks only (handles "Blog" vs "blog")
  let seo = null;
  for (const item of data) {
    if (item?.slug === "Blog" || item?.slug === "blog") {
      seo = item;
      break;
    }
  }

  // ✅ canonical always from env
  const canonical = pageUrl("/blog");

  // fallback if backend hasn't added blog yet
  if (!seo) {
    return {
      title: "Shofy - Blog Grid Page",
      alternates: { canonical },
      openGraph: { url: canonical, type: "website" },
    };
  }

  const title = pick(seo.meta_title, seo.name, "Shofy - Blog Grid Page");
  const description = pick(seo.meta_description, seo.excerpt);

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

export default function BlogGridPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />

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
        Blog - Latest Textile & Fabric Updates
      </h1>

      <SectionTitle />
      <BlogGridArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
