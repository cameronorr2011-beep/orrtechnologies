import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/fx/Reveal";
import ActionButton from "@/components/ui/ActionButton";
import JsonLd from "@/components/seo/JsonLd";
import { BLOG_POSTS, formatDate, getPostBySlug } from "@/lib/blog";
import { SITE, purchaseMailto } from "@/lib/content";
import {
  DEFAULT_OG_IMAGE,
  blogPostingSchema,
  breadcrumbSchema,
  webPageSchema,
} from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    keywords: [post.tag, "small business website", "website design", "website ownership"],
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: SITE.name, url: SITE.url }],
    openGraph: {
      type: "article",
      locale: "en_US",
      url: `/blog/${post.slug}`,
      siteName: SITE.name,
      title: post.title,
      description: post.description,
      publishedTime: `${post.date}T12:00:00.000Z`,
      modifiedTime: `${post.date}T12:00:00.000Z`,
      authors: [SITE.name],
      section: post.tag,
      tags: [post.tag, "small business website", "website design"],
      // post.image is SVG; social cards need raster, so the shared JPG stays.
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({
        path: `/blog/${post.slug}`,
        name: post.title,
        description: post.description,
      }),
      blogPostingSchema(post),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
        <div className="absolute inset-x-0 top-0 z-0 h-[440px] overflow-hidden bg-[#eef1ff]" aria-hidden="true">
          <div className="blueprint absolute inset-0 opacity-80" />
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-coral/20 blur-[90px]" />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sun/25 blur-[90px]" />
        </div>
        <div className="absolute inset-x-0 top-0 z-[1] h-[440px] bg-gradient-to-b from-transparent via-paper/40 to-paper" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-[760px] px-5 sm:px-8">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bone/40">
                <li>
                  <Link href="/" className="transition-colors hover:text-ember-200">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="transition-colors hover:text-ember-200">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="max-w-[18rem] truncate text-bone/60">
                  {post.title}
                </li>
              </ol>
            </nav>
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/40">
              <span className="rounded-full border border-electric/25 bg-electric/10 px-3 py-1 text-electric">
                {post.tag}
              </span>
              <span>By VoidBuilds</span>
              <span>·</span>
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readMinutes} min read</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display mt-6 text-[clamp(2rem,4.6vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-bone">
              {post.title}
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-[1.08rem] leading-relaxed text-bone/60">{post.description}</p>
          </Reveal>
          {post.image ? (
            <Reveal delay={220}>
              <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-3xl border border-royal-300/10">
                <Image
                  src={post.image}
                  alt={post.imageAlt ?? post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}

          <div className="mt-12 space-y-12">
            {post.sections.map((section, si) => (
              <Reveal key={section.heading} delay={si * 60}>
                <section>
                  <h2 className="font-display text-[1.5rem] font-semibold leading-snug text-bone">
                    {section.heading}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {section.paragraphs.map((p, pi) => (
                      <p key={pi} className="text-[1rem] leading-[1.75] text-bone/70">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-16 rounded-3xl glass-warm p-8">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-electric/80">
                Want this done for you?
              </p>
              <p className="font-display mt-4 text-[1.5rem] font-semibold leading-snug text-bone">
                We build websites exactly like this — $100 flat during beta.
              </p>
              <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-bone/55">
                Clear, fast, privacy-focused, and delivered to your own GitHub so you own it. Paid once in
                Bitcoin. No subscriptions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton
                  href={purchaseMailto({ planName: "Website request", notes: `I came from the blog post: ${post.title}` })}
                  external
                  event={{ name: "purchase_click", label: `blog_${post.slug}` }}
                >
                  Get started — $100
                </ActionButton>
                <ActionButton href="/pricing" variant="ghost" event={{ name: "nav", label: `blog_${post.slug}_pricing` }}>
                  Get your website — $100
                </ActionButton>
              </div>
            </div>
          </Reveal>
        </div>
      </article>

      <section className="relative z-10 border-t border-royal-300/10 py-16">
        <div className="mx-auto max-w-[760px] px-5 sm:px-8">
          <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-bone/40">
            Keep reading
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="glass edge-glow group rounded-3xl p-6 transition-colors hover:border-ember-300/25"
              >
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ember-300/70">
                  {p.tag}
                </span>
                <p className="font-display mt-3 text-[1.1rem] font-semibold leading-snug text-bone">
                  {p.title}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ember-200">
                  Read next
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
