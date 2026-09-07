import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't mis-detect it when parent
  // folders (e.g. OneDrive) also contain lockfiles.
  turbopack: {
    root: path.join(import.meta.dirname),
  },
};

export default nextConfig;
