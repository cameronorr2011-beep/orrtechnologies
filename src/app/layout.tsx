import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, JetBrains_Mono } from "next/font/google";
import ConsentAnalytics from "@/components/site/ConsentAnalytics";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import CookieConsent from "@/components/site/CookieConsent";
import ScrollProgress from "@/components/fx/ScrollProgress";
import StudioBackdrop from "@/components/site/StudioBackdrop";
import JsonLd from "@/components/seo/JsonLd";
import { SITE } from "@/lib/content";
import {
  DEFAULT_OG_IMAGE,
  SITE_KEYWORDS,
  SITE_URL,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";
import "./globals.css";

const displayFont = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const HOME_TITLE = "Animated, cinematic websites for small businesses from $100 | VoidBuilds";
const HOME_DESCRIPTION =
  "Motion-led websites for small businesses: 3D scenes, scroll animation and a promo film, written and built in 2–6 days. Starter $100, Builder $200, Premium from $500. Paid once, code delivered to your GitHub.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | VoidBuilds",
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE.name,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE.name,
    title: "VoidBuilds — websites that look like your business",
    description:
      "An animated small business website, written and built for you. 3D and scroll motion as standard. Starter $100, Builder $200, Premium from $500. Paid once, with promo videos included.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoidBuilds — websites from $100, built once and owned forever",
    description:
      "Starter $100, Builder $200, Premium from $500. The code is yours, the site loads fast, and promo videos are included. Paid once, no subscriptions.",
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${monoFont.variable}`}
      style={{ backgroundColor: "#f6f1e7", colorScheme: "light" }}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="VoidBuilds — small business website guides"
          href={`${SITE_URL}/feed.xml`}
        />
      </head>
      <body className="grain relative min-h-screen bg-void antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [organizationSchema(), websiteSchema()],
          }}
        />
        <StudioBackdrop />
        <ScrollProgress />
        <Nav />
        <main className="relative z-10">{children}</main>
        <Footer />
        <CookieConsent />
        <ConsentAnalytics />
      </body>
    </html>
  );
}
