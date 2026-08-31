import type { Metadata } from "next";
import EmberField from "@/components/fx/EmberField";
import Reveal from "@/components/fx/Reveal";
import ForgeStudio from "@/components/studio/ForgeStudio";
import Process from "@/components/sections/Process";
import ActionButton from "@/components/ui/ActionButton";
import { forgeSite } from "@/lib/forge";
import { purchaseMailto } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forge Studio — run the composition engine",
  description:
    "Describe the business. The Orr composition engine returns a seeded art direction: palette, layout grammar, motif, section architecture and opening copy — stored to Postgres, purchasable in Bitcoin.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  const initial = forgeSite(
    "Cold-chain clinical logistics moving tissue samples across 11 states, buyers are hospital procurement teams",
  );

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <EmberField />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/80 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              Forge Studio
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">Watch the machine</span>
              <span className="text-ember-gradient block">take a first pass.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              This is a thin slice of the real pipeline — the same composition pass that opens every Orr
              engagement. It is deliberately seeded and deterministic: a direction can be referenced by its
              seed in a meeting three weeks later and still be the same direction.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-3">
              <ActionButton
                href={purchaseMailto({ planName: "Forge plan", amountUsd: 3400 })}
                external
                event={{ name: "purchase_click", label: "studio_hero" }}
              >
                Purchase a build
              </ActionButton>
              <ActionButton href="/pricing" variant="ghost" event={{ name: "nav", label: "studio_pricing" }}>
                See tier pricing
              </ActionButton>
            </div>
          </Reveal>
        </div>
      </section>

      <ForgeStudio initial={initial} />
      <Process />
    </>
  );
}
