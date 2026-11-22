import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orr Technologies — Small business website design",
    short_name: "Orr Technologies",
    description: SITE.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#070510",
    theme_color: "#070510",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
