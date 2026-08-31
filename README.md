# Orr Technologies — Premium AI B2B Website Development

Source for the Orr Technologies marketing site: AI-composed, senior-reviewed
B2B website engineering at flat prices, settled in Bitcoin.

- Live: https://orrtechnologies.netlify.app
- Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Postgres (drizzle-orm) · Bitcoin settlement

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the site renders without a database
npm run dev                  # http://localhost:3000
```

Without `DATABASE_URL` the public pages fall back to the static plan catalog
in `src/lib/content.ts`; leads, orders, forge builds and the console need a
real Postgres connection.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## SEO system

Search visibility is a first-class feature, not an afterthought:

- **Metadata** — `src/app/layout.tsx` holds the canonical `metadataBase`,
  title template, description, keywords, Open Graph and Twitter cards.
  Per-page canonicals live in each route's `metadata` export.
- **Structured data** — the home page emits `ProfessionalService` (with the
  live plan catalog as `makesOffer` offers) and `FAQPage` JSON-LD. Only
  content that actually renders may be marked up.
- **Sitemap & robots** — generated at build time by `src/app/sitemap.ts` and
  `src/app/robots.ts` (`/console` and `/api/` are disallowed; `/checkout` and
  `/console` are `noindex`).
- **Media** — `public/media/` holds the Open Graph image and the work
  showcase art referenced by `src/lib/content.ts`.
- **Icon** — `src/app/icon.svg` is the favicon source.

## Deployment

Any Node host works (Netlify, Vercel, Fly). Set `DATABASE_URL` in the host
environment to activate the data layer. `next build` succeeds without it.

## License

Private — © Orr Technologies. All rights reserved.

