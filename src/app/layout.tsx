import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/fx/ScrollProgress";
import CursorEmbers from "@/components/fx/CursorEmbers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://orrtechnologies.netlify.app"),
  title: {
    default: "Orr Technologies — AI B2B website engineering at a fair price",
    template: "%s · Orr Technologies",
  },
  description:
    "Orr Technologies composes enterprise-grade B2B websites with an AI architecture pipeline and senior human review. Shader-grade motion, a real Postgres data layer, fixed flat pricing, settled in Bitcoin.",
  applicationName: "Orr Technologies",
  keywords: [
    "AI website builder",
    "B2B web development",
    "premium website design",
    "bitcoin payment web agency",
    "Next.js engineering",
    "WebGL shader websites",
    "affordable enterprise web design",
  ],
  authors: [{ name: "Orr Technologies" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Orr Technologies — big-business calibre, small-business invoice",
    description:
      "AI-assisted B2B website engineering with senior human oversight. Fixed pricing, Bitcoin settlement, full IP handover.",
    siteName: "Orr Technologies",
    images: [{ url: "/media/forge-hero.jpg", width: 1200, height: 630, alt: "Orr Technologies forge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orr Technologies — AI B2B website engineering",
    description: "Enterprise calibre builds, flat pricing, Bitcoin settlement.",
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
    <html lang="en">
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
        <Analytics />
      </body>
    </html>
  );
}
