import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Local previews are opened on 127.0.0.1, which Next 16 treats as a foreign
  // origin by default. Without this the HMR socket fails the handshake and the
  // page never hydrates, so every client effect silently stays unrun.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Pin the workspace root so Turbopack doesn't mis-detect it when parent
  // folders (e.g. OneDrive) also contain lockfiles.
  turbopack: {
    root: path.join(import.meta.dirname),
  },
};

export default nextConfig;
