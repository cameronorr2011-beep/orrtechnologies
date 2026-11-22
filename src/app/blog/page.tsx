import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import JsonLd from "@/components/seo/JsonLd";
import { BLOG_POSTS, formatDate } from "@/lib/blog";
import { purchaseMailto } from "@/lib/content";
import {
  blogCollectionSchema,
  breadcrumbSchema,
  webPageSchema,
} from "@/lib/seo";

const DESCRIPTION =
  "Practical, plain-English guides on website design, ownership, privacy, pricing and promo videos for small business owners. No jargon, no sales pitch.";

export const metadata: Metadata = {
  title: { absolute: "Small Business Website Guides | VoidBuilds" },
  description: DESCRIPTION,
  keywords: [
    "small business website guide",
    "website design advice",
    "website ownership",
    "website pricing guide",
    "privacy focused website",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    siteName: "VoidBuilds",
    title: "Small Business Website Guides",
    description: DESCRIPTION,
    images: [{ url: "/media/voidbuilds-og.jpg", width: 1200, height: 630, alt: "VoidBuilds website guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Small Business Website Guides | VoidBuilds",
    description: DESCRIPTION,
    images: ["/media/voidbuilds-og.jpg"],
  },
};

export default function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = sorted;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({
        path: "/blog",
        name: "Small business website guides",
        description: DESCRIPTION,
      }),
      blogCollectionSchema(sorted, DESCRIPTION),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        kicker="Blog"
        title={
          <>
            Website advice for{" "}
            <span className="text-ember-300">small businesses.</span>
          </>
        }
        body="Short guides for business owners: what a good website needs, what it should cost, and how to avoid the traps. No jargon, no sales pitch."
      />

      <section className="relative z-10 pb-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block border border-bone/12 p-8 transition-colors hover:border-bone/35 sm:p-10"
            >
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-300/75">
                {featured.tag} · {formatDate(featured.date)} · {featured.readMinutes} min read
              </span>
              {featured.image ? (
                <div className="relative mt-6 aspect-[16/7] overflow-hidden border border-bone/10">
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt ?? featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1180px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <h2 className="font-display mt-5 max-w-3xl text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-tight text-bone">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-bone/55">
                {featured.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ember-200">
                Read the guide
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={i * 80}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col border border-bone/12 p-7 transition-colors hover:border-bone/35"
                >
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ember-300/70">
                    {post.tag}
                  </span>
                  {post.image ? (
                    <div className="relative mt-4 aspect-[16/6] overflow-hidden border border-bone/10">
                      <Image
                        src={post.image}
                        alt={post.imageAlt ?? post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <h2 className="font-display mt-4 text-[1.25rem] font-semibold leading-snug text-bone">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-[0.86rem] leading-relaxed text-bone/55">
                    {post.description}
                  </p>
                  <span className="mt-6 flex items-center justify-between border-t border-royal-300/10 pt-4 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/35">
                    <span>{formatDate(post.date)}</span>
                    <span>{post.readMinutes} min read</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl glass-warm p-8 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-[1.4rem] font-semibold text-bone">
                  Prefer someone else to do the work?
                </p>
                <p className="mt-2 max-w-xl text-[0.9rem] text-bone/55">
                  We build the whole thing for you — $100 flat during beta, delivered to your own GitHub.
                </p>
              </div>
              <ActionButton
                href={purchaseMailto({ planName: "Website request", notes: "I read the blog and want to get started." })}
                external
                event={{ name: "purchase_click", label: "blog_cta" }}
              >
                Get started — $100
              </ActionButton>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
        <SectionHeading
          kicker="More coming"
          title={
            <>
              New guides <span className="text-ember-gradient">most weeks</span>
            </>
          }
          body="We write about the questions real business owners ask us — pricing, ownership, privacy, and what actually brings in customers."
        />
      </div>
    </>
  );
}
