import Wrapper       from '@/layout/wrapper';
import HeaderTwo     from '@/layout/headers/header-2';
import Footer        from '@/layout/footers/footer';
import ProductClient from './ProductDetailsClient';

export const revalidate = 600;

/* -----------------------------
  helpers
----------------------------- */
const pick = (...v) => v.find(x => x !== undefined && x !== null && String(x).trim() !== '');

const stripTrailingSlash = (s = '') => String(s || '').replace(/\/+$/, '');

const stripHtml = (html = '') =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ✅ SITE URL from env (live domain)
const SITE_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || '');

// ✅ API base from env (keep your env like: https://test.amrita-fashions.com/shopy)
const API_BASE = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || '');

// ✅ build page url like /fabric/{slug}
const pageUrl = (path = '/') => {
  if (!SITE_URL) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// ✅ make absolute for OG images (if API returns relative paths)
const toAbsUrl = (u = '') => {
  const s = String(u || '').trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  return pageUrl(s);
};

// Next.js only allows a fixed list of OG types in the metadata API.
// Your API returns "product" -> must map it to "website" to avoid runtime error.
const sanitizeOgType = (t) => {
  const v = String(t || '').toLowerCase();

  if (v === 'product') return 'website';

  const allowed = new Set([
    'website', 'article', 'book', 'profile',
    'music.song', 'music.album', 'music.playlist', 'music.radio_station',
    'video.movie', 'video.episode', 'video.tv_show', 'video.other',
  ]);

  return allowed.has(v) ? v : 'website';
};

/* -----------------------------
  Product fetcher (YOUR API)
----------------------------- */
async function getProductBySlug(slug) {
  try {
    // ✅ uses env base (so you don't hardcode domain)
    const res = await fetch(`${API_BASE}/product`, {
      next: { revalidate },
    });
    if (!res.ok) return null;

    const j = await res.json();
    const list = Array.isArray(j?.data) ? j.data : [];

    return (
      list.find(p => String(p?.slug || '').trim() === String(slug || '').trim()) || null
    );
  } catch {
    return null;
  }
}

/* -----------------------------
  Metadata
----------------------------- */
export async function generateMetadata({ params }) {
  const { slug } = params;

  const product = await getProductBySlug(slug);

  // ✅ canonical + og:url always from env + /fabric/{slug}
  const canonical = pageUrl(`/fabric/${slug}`);

  const fallbackTitle = String(slug || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const title = pick(product?.productTitle, product?.name, fallbackTitle);

  const description = stripHtml(
    pick(product?.shortProductDescription, '')
  );

  const twitterCard = pick(product?.twitterCard, 'summary_large_image');
  const ogType = sanitizeOgType(product?.ogType);

  // ✅ OG image should be "image1" field (your requirement)
  // (fallback to main img only if image1 is empty, so OG is not blank)
  const ogImageUrl = toAbsUrl(pick(product?.image1, product?.img, product?.image, ''));

  return {
    title,
    description,

    // ✅ canonical url
    alternates: { canonical },

    // ✅ OG url + OG image
    openGraph: {
      type: ogType,
      url: canonical,
      images: ogImageUrl ? [{ url: ogImageUrl, alt: title }] : undefined,
      title,
      description,
    },

    // optional but good: twitter image uses same
    twitter: {
      card: twitterCard,
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

/* -----------------------------
  Page component
----------------------------- */
export default async function Page({ params }) {
  const { slug } = params;

  return (
    <Wrapper>
      <HeaderTwo style_2 />
      <ProductClient slug={slug} />
      <Footer primary_style />
    </Wrapper>
  );
}
