"use client";

import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import TiltCard from "@/components/fx/TiltCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { MEDIA_OFFER, purchaseMailto } from "@/lib/content";

export default function MediaOffer() {
  return (
    <section id="media" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="pointer-events-none absolute left-0 top-40 h-[400px] w-[400px] rounded-full bg-royal-600/12 blur-[130px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          kicker={MEDIA_OFFER.kicker}
          title={
            <>
              You give us what you have.{" "}
              <span className="text-ember-gradient">We make the video and build the whole site.</span>
            </>
          }
          body={MEDIA_OFFER.body}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <TiltCard className="h-full rounded-[1.75rem]" intensity={4}>
              <article className="glass edge-glow flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                <div className="relative aspect-[8/5]">
                  <Image
                    src="/media/free-promo-video.svg"
                    alt="Illustration of a promo video for a small business, with music and captions, playing inside a video frame"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-ember-300/75">
                    Included free
                  </span>
                  <h3 className="font-display mt-3 text-[1.35rem] font-semibold text-bone">
                    A promo video for your business
                  </h3>
                  <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-bone/55">
                    We build a short video from your photos and clips — clean text, music, smooth
                    movement. It plays on your website and you get a copy to post anywhere.
                  </p>
                  <ul className="mt-6 space-y-2.5 border-t border-royal-300/10 pt-5">
                    {["Made from your photos and clips", "Ready to post on social media", "Included at no extra cost"].map(
                      (p) => (
                        <li key={p} className="flex items-start gap-3 text-[0.84rem] text-bone/65">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper" />
                          {p}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </article>
            </TiltCard>
          </Reveal>

          <Reveal delay={100}>
            <TiltCard className="h-full rounded-[1.75rem]" intensity={4}>
              <article className="glass edge-glow flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                <div className="relative aspect-[8/5]">
                  <Image
                    src="/media/send-what-you-have.svg"
                    alt="Illustration of phone photos, notes and a rough video going in, and a finished website plus promo video coming out"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-ember-300/75">
                    Nothing to prepare
                  </span>
                  <h3 className="font-display mt-3 text-[1.35rem] font-semibold text-bone">
                    Send whatever you have
                  </h3>
                  <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-bone/55">
                    Phone photos, a rough clip, a price list, or a few sentences — whatever you have
                    is enough. We write the words, source sharp images where needed, and build the
                    full website around what you sent.
                  </p>
                  <ul className="mt-6 space-y-2.5 border-t border-royal-300/10 pt-5">
                    {["Phone photos are fine", "We write all the text for you", "Got nothing ready? We'll plan it together"].map(
                      (p) => (
                        <li key={p} className="flex items-start gap-3 text-[0.84rem] text-bone/65">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper" />
                          {p}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </article>
            </TiltCard>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="glass rounded-3xl p-7">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-bone/40">
                What you can send us
              </p>
              <ul className="mt-4 space-y-2.5">
                {MEDIA_OFFER.youHave.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.88rem] text-bone/65">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-warm rounded-3xl p-7">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-200/70">
                What we make from it
              </p>
              <ul className="mt-4 space-y-2.5">
                {MEDIA_OFFER.weMake.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.88rem] text-bone/70">
                    <svg width="14" height="14" viewBox="0 0 16 16" className="mt-[5px] shrink-0 text-ember-300" aria-hidden="true">
                      <path d="M2 8.5l3.5 3.5L14 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl glass-warm p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-[1.5rem] font-semibold text-bone">
                Full website plus a free promo video — $100.
              </p>
              <p className="mt-2 max-w-xl text-[0.92rem] text-bone/55">
                Attach your photos and clips to your first email. If you don&apos;t have anything
                yet, just tell us about your business and we&apos;ll take it from there.
              </p>
            </div>
            <ActionButton
              href={purchaseMailto({
                planName: "Your website",
                notes: "I'd like the website and the free promo video. Here's what I have:",
              })}
              external
              event={{ name: "purchase_click", label: "media_offer_cta" }}
            >
              Get started — $100
            </ActionButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
