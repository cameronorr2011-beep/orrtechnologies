import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import AmbientAudio from "@/components/site/AmbientAudio";
import CookieConsent from "@/components/site/CookieConsent";
import ScrollProgress from "@/components/fx/ScrollProgress";
import CursorEmbers from "@/components/fx/CursorEmbers";
import { SITE } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Orr Technologies — $100 websites with a free promo video",
    template: "%s · Orr Technologies",
  },
  description:
    "Complete websites for small businesses at $100 flat during beta — plus a free promo video made from your photos and clips. You own the code, it's delivered to your own GitHub, and it's private by default. Pay once in Bitcoin.",
  applicationName: "Orr Technologies",
  keywords: [
    "affordable website design",
    "$100 website",
    "small business website",
    "you own your website",
    "free promo video",
    "privacy focused website",
    "pay in bitcoin",
    "website design blog",
  ],
  authors: [{ name: "Orr Technologies" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Orr Technologies — a full website and a free promo video",
    description:
      "$100 flat websites during beta, with a free promo video made from your photos and clips. You own the code, it lives in your GitHub, and your visitors' privacy is respected. Paid in Bitcoin.",
    siteName: "Orr Technologies",
    images: [{ url: "/media/forge-hero.jpg", width: 1200, height: 630, alt: "Orr Technologies forge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orr Technologies — $100 websites with a free promo video",
    description: "$100 flat websites during beta. You own the code. Free promo video included. Private by default. Paid in Bitcoin.",
    images: ["/media/forge-hero.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070510",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ backgroundColor: "#070510", colorScheme: "dark" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="grain vignette relative min-h-screen bg-void antialiased">
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
