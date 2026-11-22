import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import CookieConsent from "@/components/site/CookieConsent";
import ScrollProgress from "@/components/fx/ScrollProgress";
import StarDrift from "@/components/fx/StarDrift";
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

const HOME_TITLE = "VoidBuilds — websites from $100, built once and owned forever";
const HOME_DESCRIPTION =
  "VoidBuilds designs and builds custom websites for small businesses. Starter $100, Builder $200, Premium from $500. One payment, promo videos included, and the code is delivered to your GitHub.";

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
    title: "VoidBuilds — a website with gravity",
    description:
      "A custom small business website, written and built for you. Starter $100, Builder $200, Premium from $500. Paid once, with promo videos included.",
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
  themeColor: "#060607",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${monoFont.variable}`}
      style={{ backgroundColor: "#060607", colorScheme: "dark" }}
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
        <StarDrift />
        <ScrollProgress />
        <Nav />
        <main className="relative">{children}</main>
        <Footer />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
