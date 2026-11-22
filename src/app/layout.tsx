import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import AmbientAudio from "@/components/site/AmbientAudio";
import CookieConsent from "@/components/site/CookieConsent";
import ScrollProgress from "@/components/fx/ScrollProgress";
import CursorEmbers from "@/components/fx/CursorEmbers";
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

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const HOME_TITLE = "Small Business Website Design for $100 | Orr Technologies";
const HOME_DESCRIPTION =
  "A complete custom website for your small business, written and built for you. $100 flat during beta, delivered to your GitHub, with a free promo video.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | Orr Technologies",
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
    title: "Small Business Website Design for $100",
    description:
      "A custom small business website, written and built for you. $100 flat during beta, delivered to your GitHub, with a free promo video. Paid once in Bitcoin.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Small Business Website Design for $100 | Orr Technologies",
    description:
      "$100 flat during beta. You own the code, the site loads fast, and a free promo video is included. Pay once in Bitcoin.",
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
  themeColor: "#070510",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}
      style={{ backgroundColor: "#070510", colorScheme: "dark" }}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Orr Technologies — small business website guides"
          href={`${SITE_URL}/feed.xml`}
        />
      </head>
      <body className="grain vignette relative min-h-screen bg-void antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [organizationSchema(), websiteSchema()],
          }}
        />
        <ScrollProgress />
        <CursorEmbers />
        <Nav />
        <main className="relative">{children}</main>
        <Footer />
        <CookieConsent />
        <AmbientAudio />
        <Analytics />
      </body>
    </html>
  );
}
