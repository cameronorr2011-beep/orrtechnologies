import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VoidBuilds — websites with gravity",
    short_name: "VoidBuilds",
    description: SITE.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#060607",
    theme_color: "#060607",
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
