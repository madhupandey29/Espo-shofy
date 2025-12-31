// app/blog-details/[id]/page.jsx
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import BlogDetailsArea from "@/components/blog-details/blog-details-area";

const stripTrailingSlash = (s = "") => String(s || "").replace(/\/+$/, "");

const API_BASE = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000");
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_PATH || "/blogs";

const SITE_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "");

const pageUrl = (path = "/") => {
  if (!SITE_URL) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const toAbsUrl = (u = "") => {
  const s = String(u || "").trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  return pageUrl(s);
};

async function getBlog(id) {
  const res = await fetch(`${API_BASE}${BLOG_PATH}/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export async function generateMetadata({ params }) {
  const blog = await getBlog(params.id);

  const canonical = pageUrl(`/blog-details/${params.id}`);
  const title = blog?.title ? `${blog.title} | Blog` : "Blog Details";
  const description = blog?.heading || blog?.paragraph1 || "";

  const ogImg = toAbsUrl(blog?.blogimage1 || blog?.blogimage2 || "");

  return {
    title,
    description,
    alternates: { canonical },

    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: ogImg ? [{ url: ogImg, alt: blog?.title || "Blog image" }] : undefined,
    },

    twitter: {
      card: ogImg ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImg ? [ogImg] : undefined,
    },
  };
}

export default async function BlogDetails({ params }) {
  const blog = await getBlog(params.id);

  return (
    <Wrapper>
      <HeaderTwo style_2 />
      <BlogDetailsArea blog={blog} />
      <Footer primary_style />
    </Wrapper>
  );
}
