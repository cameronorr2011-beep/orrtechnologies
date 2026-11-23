import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Renders, browser profile dumps and extracted vendor JS live here; they are
    // gitignored output, not source, and linting them took minutes of dead time
    // (a Chrome extension bundle inside a captured profile alone is >500 KB).
    "studio-out/**",
    // Vendored MCP server with its own toolchain and test suite; it is a
    // submodule-style drop-in, not part of this app's lint surface.
    "tools/resolve-mcp/**",
  ]),
]);
