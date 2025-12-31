import './globals.scss';
import '../styles/carousel-mobile-fix.css';
import Providers from '@/components/provider';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import MicrosoftClarity from '@/components/analytics/MicrosoftClarity';
import Script from 'next/script';

import '/public/assets/css/font-awesome-pro.css';

/* -------------------------------------------------- */
/* Fetch Default SEO (SERVER)                          */
/* -------------------------------------------------- */
async function getDefaultSeo() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/defaultseo`,
    { cache: 'no-store' }
  );

  if (!res.ok) return null;
  const json = await res.json();
  return json?.[0] ?? null;
}

/* -------------------------------------------------- */
/* Metadata (META TAGS ONLY)                          */
/* -------------------------------------------------- */
export async function generateMetadata() {
  const seo = await getDefaultSeo();
  if (!seo) return {};

  return {
    robots: seo.robots,

    verification: {
      google: seo.googleSiteVerification,
      other: {
        'msvalidate.01': seo.microsofttoken,
      },
    },

    appleWebApp: {
      capable: seo.mobileWebAppCapable === 'yes',
      statusBarStyle: seo.appleStatusBarStyle,
    },

    formatDetection: {
      telephone: false,
    },

    twitter: {
      site: seo.twittersite,
      card: 'summary_large_image',
    },

    openGraph: {
      type: 'website',
      siteName: seo.ogsitename,
    },
  };
}

/* -------------------------------------------------- */
/* Root Layout                                        */
/* -------------------------------------------------- */
export default async function RootLayout({ children }) {
  const seo = await getDefaultSeo();

  const localBusinessJsonLd = seo && {
    '@context': seo.localbussinessjsonldcontext,
    '@type': seo.localbussinessjsonldtype,
    name: seo.localbussinessjsonldname,
    telephone: seo.localbussinessjsonldtelephone,
    areaServed: seo.localbussinessjsonldareaserved,
    address: {
      '@type': seo.localbussinessjsonldaddresstype,
      streetAddress: seo.localbussinessjsonldaddressstreetaddress,
      addressLocality: seo.localbussinessjsonldaddressaddresslocality,
      addressRegion: seo.localbussinessjsonldaddressaddressregion,
      postalCode: seo.localbussinessjsonldaddresspostalcode,
      addressCountry: seo.localbussinessjsonldaddressaddresscountry,
    },
    geo: {
      '@type': seo.localbussinessjsonldgeotype,
      latitude: seo.localbussinessjsonldgeolatitude,
      longitude: seo.localbussinessjsonldgeolongitude,
    },
  };

  return (
    <html lang="en">
      <head>
        {/* ✅ Analytics from API */}
        <GoogleAnalytics gaId={seo?.gaId} />
        <MicrosoftClarity clarityId={seo?.clarityId} />

        {/* ✅ JSON-LD */}
        {localBusinessJsonLd && (
          <Script
            id="local-business-jsonld"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(localBusinessJsonLd),
            }}
          />
        )}
      </head>

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
