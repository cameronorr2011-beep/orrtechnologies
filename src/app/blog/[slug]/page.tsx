import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/fx/Reveal";
import EmberField from "@/components/fx/EmberField";
import ActionButton from "@/components/ui/ActionButton";
import { BLOG_POSTS, formatDate, getPostBySlug } from "@/lib/blog";
import { purchaseMailto } from "@/lib/content";

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
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
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

  return (
    <>
      <article className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
        <div className="absolute inset-x-0 top-0 z-0 h-[420px] opacity-60" aria-hidden="true">
          <EmberField variant="core" />
        </div>
        <div className="absolute inset-x-0 top-0 z-[1] h-[420px] bg-gradient-to-b from-transparent via-void/70 to-void" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-[760px] px-5 sm:px-8">
          <Reveal>
            <Link
              href="/blog"
              className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-bone/40 transition-colors hover:text-ember-200"
            >
              ← All posts
            </Link>
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/40">
              <span className="rounded-full border border-ember-200/25 bg-ember-500/10 px-3 py-1 text-ember-100/85">
                {post.tag}
              </span>
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
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-100/75">
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
                  See packages
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
