import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import EmberField from "@/components/fx/EmberField";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { BLOG_POSTS, formatDate } from "@/lib/blog";
import { purchaseMailto } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog — plain-language website advice for small businesses",
  description:
    "Short, jargon-free guides on what a good website needs, why you should own it, how privacy works, and what things should cost.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
        <div className="absolute inset-0 z-0 opacity-70" aria-hidden="true">
          <EmberField variant="core" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/70 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              Blog
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">Website advice</span>
              <span className="text-ember-gradient block">in plain English.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              Short guides for business owners: what a good website needs, what it should cost, and how to
              avoid the traps. No jargon, no sales pitch.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="glass edge-glow group block rounded-[1.75rem] p-8 transition-colors hover:border-ember-300/25 sm:p-10"
            >
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-300/75">
                {featured.tag} · {formatDate(featured.date)} · {featured.readMinutes} min read
              </span>
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
                  className="glass edge-glow group flex h-full flex-col rounded-3xl p-7 transition-colors hover:border-ember-300/25"
                >
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ember-300/70">
                    {post.tag}
                  </span>
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
