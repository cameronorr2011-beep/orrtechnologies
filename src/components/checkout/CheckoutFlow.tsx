"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Reveal from "@/components/fx/Reveal";
import ActionButton from "@/components/ui/ActionButton";
import { SITE, purchaseMailto } from "@/lib/content";
import type { PlanView } from "@/components/sections/PricingTable";
import { trackEvent } from "@/lib/track";

type Invoice = {
  code: string;
  planName: string;
  amountUsd: number;
  btcAmount: string;
  rate: number;
  rateLive: boolean;
  network: string;
  memo: string;
  contactEmail: string;
};

const STEPS = [
  "Send the request below — it opens an email thread with us.",
  "We reply with the exact Bitcoin amount and a payment address for your order.",
  "You pay from your own wallet. That's the whole cost: $100.",
  "We start building. Your finished site is delivered to your GitHub.",
];

export default function CheckoutFlow({ plans }: { plans: PlanView[] }) {
  const params = useSearchParams();
  const initialSlug = params.get("plan") ?? plans.find((p) => p.featured)?.slug ?? plans[0]?.slug ?? "";
  const [slug, setSlug] = useState(initialSlug);
  const [form, setForm] = useState({ contactName: "", contactEmail: "", company: "", notes: "" });
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const plan = useMemo(() => plans.find((p) => p.slug === slug) ?? plans[0], [plans, slug]);

  const field =
    "w-full rounded-2xl border border-royal-300/15 bg-royal-950/60 px-5 py-3.5 text-[0.92rem] text-bone placeholder:text-bone/25 transition-colors focus:border-ember-300/55 focus:outline-none";

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.slug, ...form }),
      });
      const data = (await res.json()) as { ok?: boolean; invoice?: Invoice; error?: string };
      if (!res.ok || !data.invoice) throw new Error(data.error ?? "Could not open the invoice.");
      setInvoice(data.invoice);
      trackEvent("order_opened", data.invoice.code, { plan: plan.slug, amountUsd: plan.priceUsd });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const mailto = invoice
    ? purchaseMailto({
        planName: invoice.planName,
        invoiceCode: invoice.code,
        amountUsd: invoice.amountUsd,
        company: form.company,
        name: form.contactName,
        notes: [
          form.notes,
          `Indicative BTC amount at issue: ${invoice.btcAmount} BTC (rate $${invoice.rate.toLocaleString("en-US")}).`,
        ]
          .filter(Boolean)
          .join("\n"),
      })
    : purchaseMailto({
        planName: plan?.name ?? "Website request",
        amountUsd: plan?.priceUsd,
        company: form.company,
        name: form.contactName,
        notes: form.notes,
      });

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
      {invoice ? (
        <Reveal>
          <div className="glass-warm relative overflow-hidden rounded-[1.75rem] p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 noise-panel opacity-70" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-100/75">
                    Your order
                  </p>
                  <h2 className="font-display mt-4 text-[2.2rem] font-semibold leading-none text-bone">
                    {invoice.code}
                  </h2>
                  <p className="mt-3 text-[0.95rem] text-bone/60">
                    {invoice.planName} · ${invoice.amountUsd.toLocaleString("en-US")} USD
                  </p>
                </div>
                <div className="rounded-2xl border border-ember-200/20 bg-void/40 px-5 py-4 text-right">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">
                    Roughly, in Bitcoin
                  </p>
                  <p className="font-display mt-2 text-2xl text-ember-100">{invoice.btcAmount} BTC</p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/35">
                    {invoice.rateLive ? "today's rate" : "reference rate"} $
                    {invoice.rate.toLocaleString("en-US")}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-royal-300/12 bg-void/40 p-6">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">
                    How you pay
                  </p>
                  <p className="mt-2 text-[0.92rem] text-bone/80">{invoice.network}</p>
                  <p className="mt-4 text-[0.84rem] leading-relaxed text-bone/50">{invoice.memo}</p>
                </div>
                <div className="rounded-2xl border border-royal-300/12 bg-void/40 p-6">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">
                    Questions?
                  </p>
                  <button
                    type="button"
                    onClick={() => void copy(SITE.email, "email")}
                    className="mt-2 block font-mono text-[0.92rem] text-ember-200 transition-colors hover:text-gold"
                  >
                    {SITE.emailDisplay}
                  </button>
                  <p className="mt-4 text-[0.84rem] leading-relaxed text-bone/50">
                    {copied === "email" ? "Copied." : "Click to copy. We reply within one business day."}
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-ember-200/20 bg-gradient-to-br from-ember-500/12 to-royal-700/20 p-7">
                <p className="text-[0.95rem] leading-relaxed text-bone/80">
                  Next step: send the email below. It includes your order code and the rough Bitcoin amount —
                  we reply with the final amount and the payment address on the same thread.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton
                    href={mailto}
                    external
                    event={{ name: "purchase_click", label: "invoice_mailto", meta: { code: invoice.code } }}
                  >
                    Send request email
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    onClick={() => void copy(`${invoice.code} · ${invoice.amountUsd} USD · ${invoice.btcAmount} BTC`, "inv")}
                    event={{ name: "copy_invoice", label: invoice.code }}
                  >
                    {copied === "inv" ? "Copied" : "Copy order details"}
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      ) : null}

      <div className={`mt-8 grid gap-8 ${invoice ? "opacity-70" : ""} lg:grid-cols-[1.05fr_0.95fr]`}>
        <Reveal>
          <form onSubmit={submit} className="glass edge-glow rounded-[1.75rem] p-8">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
              Choose your package
            </p>

            <div className="mt-6 space-y-3">
              {plans.map((p) => {
                const active = p.slug === slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSlug(p.slug)}
                    className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
                      active
                        ? "border-ember-300/50 bg-ember-500/10"
                        : "border-royal-300/12 bg-royal-950/40 hover:border-royal-300/30"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-display text-[1.2rem] font-semibold text-bone">{p.name}</span>
                      <span className="font-mono text-[0.8rem] text-ember-200">$100 · one-time</span>
                    </div>
                    <p className="mt-1.5 text-[0.84rem] leading-relaxed text-bone/50">{p.tagline}</p>
                    <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/35">
                      {p.turnaround} · {p.pages}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <input
                  required
                  value={form.contactName}
                  onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                  placeholder="Your name"
                  aria-label="Your name"
                  className={field}
                />
                <input
                  required
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="Your email"
                  aria-label="Your email"
                  className={field}
                />
              </div>
              <input
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Business name"
                aria-label="Business name"
                className={field}
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Anything we should know? Deadlines, examples you like, questions…"
                aria-label="Notes"
                className={`${field} resize-none`}
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <ActionButton
                type="submit"
                disabled={loading}
                event={{ name: "checkout_submit", label: slug }}
              >
                {loading ? "Creating your order" : "Get my Bitcoin invoice"}
              </ActionButton>
              <ActionButton
                href={mailto}
                external
                variant="ghost"
                event={{ name: "purchase_click", label: "checkout_direct_mailto" }}
              >
                Email us instead
              </ActionButton>
            </div>

            {error ? <p className="mt-5 font-mono text-[0.7rem] leading-relaxed text-maple">{error}</p> : null}

            <p className="mt-6 border-t border-royal-300/10 pt-5 font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-bone/35">
              Asking for an invoice costs nothing and commits you to nothing. You only ever pay from your own
              wallet, to an address created for your order.
            </p>
          </form>
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={90}>
            <div className="glass rounded-[1.75rem] p-8">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
                How payment works
              </p>
              <ol className="mt-6 space-y-5">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span className="font-mono text-[0.7rem] text-ember-300/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.9rem] leading-relaxed text-bone/60">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="glass rounded-[1.75rem] p-8">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
                Why Bitcoin
              </p>
              <p className="mt-5 text-[0.92rem] leading-relaxed text-bone/60">
                Card companies add fees and can reverse payments months later. Bitcoin is one payment,
                straight between us — which is part of how the price stays at $100.
              </p>
              <p className="mt-5 text-[0.92rem] leading-relaxed text-bone/60">
                The amount is confirmed by email before you send anything. Nothing is ever auto-charged, and
                there are no subscriptions to cancel.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
