import Link from "next/link";
import EmberField from "@/components/fx/EmberField";
import ActionButton from "@/components/ui/ActionButton";
import { purchaseMailto } from "@/lib/content";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <EmberField />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/85 to-void" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-[1280px] gap-10 px-5 py-32 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
            404 · dead link
          </p>
          <h1 className="font-display mt-6 text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-bone-gradient">
            That page never left the forge.
          </h1>
          <p className="mt-6 max-w-lg text-[1rem] leading-relaxed text-bone/55">
            The URL doesn&apos;t map to anything we ship. Head back to the surface, or open a build slot and
            we&apos;ll put something worth loading here.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ActionButton href="/" event={{ name: "nav", label: "404_home" }}>
              Back to the homepage
            </ActionButton>
            <ActionButton
              href={purchaseMailto({ planName: "Build request", notes: "Arrived from a broken link." })}
              external
              variant="ghost"
              event={{ name: "purchase_click", label: "404_purchase" }}
            >
              Email the desk
            </ActionButton>
          </div>
        </div>
        <div className="glass rounded-3xl p-8">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-bone/40">Useful instead</p>
          <ul className="mt-6 space-y-4 text-[0.95rem]">
            {[
              { href: "/pricing", label: "Tier pricing & comparison" },
              { href: "/studio", label: "Run the composition engine" },
              { href: "/checkout", label: "Bitcoin invoice flow" },
              { href: "/#work", label: "Selected work" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="ember-underline text-bone/70 hover:text-ember-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
