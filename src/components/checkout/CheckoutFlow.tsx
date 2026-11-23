"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Reveal from "@/components/fx/Reveal";
import ActionButton from "@/components/ui/ActionButton";
import { PAYMENT_METHODS, SITE, purchaseMailto, type PaymentMethodId } from "@/lib/content";
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
  payment: {
    id: PaymentMethodId;
    name: string;
    amount: string;
    note: string;
    accepted: string[];
  };
};

export default function CheckoutFlow({ plans }: { plans: PlanView[] }) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("plan");
  const [planSlug, setPlanSlug] = useState(
    () =>
      plans.find((p) => p.slug === requested)?.slug ??
      plans.find((p) => p.featured)?.slug ??
      plans[0]?.slug ??
      "",
  );
  const plan = plans.find((p) => p.slug === planSlug) ?? plans[0];
  const [form, setForm] = useState({ contactName: "", contactEmail: "", company: "", notes: "" });
  const [methodId, setMethodId] = useState<PaymentMethodId>("bitcoin");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const method = PAYMENT_METHODS.find((m) => m.id === methodId) ?? PAYMENT_METHODS[0];
  const invoiceMethod = invoice
    ? PAYMENT_METHODS.find((m) => m.id === invoice.payment.id) ?? method
    : method;
  const steps = invoice ? invoiceMethod.steps : method.steps;

  const field =
    "w-full border border-bone/15 bg-white px-5 py-3.5 text-[0.92rem] text-bone placeholder:text-bone/25 transition-colors focus:border-ember-300/55 focus:outline-none";

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
        body: JSON.stringify({ planSlug: plan.slug, paymentMethod: methodId, ...form }),
      });
      const data = (await res.json()) as { ok?: boolean; invoice?: Invoice; error?: string };
      if (!res.ok || !data.invoice) throw new Error(data.error ?? "Could not open the invoice.");
      setInvoice(data.invoice);
      trackEvent("order_opened", data.invoice.code, {
        plan: plan.slug,
        amountUsd: plan.priceUsd,
        method: data.invoice.payment.id,
      });
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
        payment: invoice.payment.name,
        company: form.company,
        name: form.contactName,
        notes: [
          form.notes,
          invoice.payment.id === "giftcard"
            ? `Preferred payment: gift cards (${invoice.payment.accepted.join(", ")}).`
            : `Preferred payment: ${invoice.payment.name}. Indicative BTC amount at issue: ${invoice.btcAmount} BTC (rate $${invoice.rate.toLocaleString("en-US")}).`,
        ]
          .filter(Boolean)
          .join("\n"),
      })
    : purchaseMailto({
        planName: plan?.name ?? "Website request",
        amountUsd: plan?.priceUsd,
        payment: method.name,
        company: form.company,
        name: form.contactName,
        notes: form.notes,
      });

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
      {invoice ? (
        <Reveal>
          <div className="relative overflow-hidden border border-bone/15 bg-[#fff7e6] p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 noise-panel opacity-70" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-electric">
                    Your order
                  </p>
                  <h2 className="font-display mt-4 text-[2.2rem] font-semibold leading-none text-bone">
                    {invoice.code}
                  </h2>
                  <p className="mt-3 text-[0.95rem] text-bone/60">
                    {invoice.planName} · ${invoice.amountUsd.toLocaleString("en-US")} USD
                  </p>
                </div>
                <div className="border border-bone/15 bg-void/40 px-5 py-4 text-right">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">
                    {invoice.payment.id === "giftcard" ? "In gift cards" : "Roughly, in Bitcoin"}
                  </p>
                  <p className="font-display mt-2 text-2xl text-electric">
                    {invoice.payment.id === "giftcard" ? `$${invoice.amountUsd}` : `${invoice.btcAmount} BTC`}
                  </p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/35">
                    {invoice.payment.id === "giftcard"
                      ? "$25 / $50 / $100 cards"
                      : `${invoice.rateLive ? "today's rate" : "reference rate"} $${invoice.rate.toLocaleString("en-US")}`}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="border border-bone/12 bg-white p-6">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">
                    How you pay
                  </p>
                  <p className="mt-2 text-[0.92rem] text-bone/80">{invoice.payment.name}</p>
                  <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ember-200/70">
                    {invoice.payment.amount}
                  </p>
                  <p className="mt-4 text-[0.84rem] leading-relaxed text-bone/50">{invoice.payment.note}</p>
                  {invoice.payment.accepted.length ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {invoice.payment.accepted.map((card) => (
                        <span
                          key={card}
                          className="border border-bone/15 px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-bone/50"
                        >
                          {card}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="border border-bone/12 bg-white p-6">
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

              <div className="mt-8 border border-ember-300/30 bg-[#fff7e6] p-7">
                <p className="text-[0.95rem] leading-relaxed text-bone/80">
                  Next step: send the email below. It includes your order code and your chosen payment
                  method — we reply with the final details on the same thread.
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
                    onClick={() =>
                      void copy(
                        `${invoice.code} · ${invoice.amountUsd} USD · ${invoice.payment.name}${
                          invoice.payment.id === "giftcard" ? "" : ` · ${invoice.btcAmount} BTC`
                        }`,
                        "inv",
                      )
                    }
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
          <form onSubmit={submit} className="border border-bone/12 bg-white p-8">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
              Your package{plan ? ` — ${plan.priceLabel ?? `$${plan.priceUsd}`}` : ""}
            </p>

            <p className="mt-4 text-[0.9rem] leading-relaxed text-bone/55">
              Pick a package, tell us about the business and how you&apos;d like to pay, and we&apos;ll email
              your invoice.
            </p>

            <div className="mt-6">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">Package</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {plans.map((option) => {
                  const on = option.slug === plan?.slug;
                  return (
                    <button
                      key={option.slug}
                      type="button"
                      onClick={() => setPlanSlug(option.slug)}
                      aria-pressed={on}
                      className={`border px-4 py-3 text-left transition-colors ${
                        on ? "border-ember-300/55 bg-ember-500/8" : "border-bone/12 hover:border-bone/30"
                      }`}
                    >
                      <span className={`block text-[0.8rem] font-semibold ${on ? "text-bone" : "text-bone/65"}`}>
                        {option.name}
                      </span>
                      <span className="mt-1 block font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.1em] text-bone/40">
                        {option.priceLabel ?? `$${option.priceUsd}`} · {option.turnaround}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">
                How you&apos;ll pay
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {PAYMENT_METHODS.map((option) => {
                  const on = option.id === methodId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMethodId(option.id)}
                      aria-pressed={on}
                      className={`border px-4 py-3 text-left transition-all duration-300 ${
                        on
                          ? "border-ember-300/50 bg-ember-500/10"
                          : "border-bone/12 bg-white hover:border-bone/30"
                      }`}
                    >
                      <span className={`block text-[0.82rem] font-semibold ${on ? "text-bone" : "text-bone/65"}`}>
                        {option.name}
                      </span>
                      <span className="mt-1 block font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.1em] text-bone/40">
                        {option.short}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-bone/45">{method.blurb}</p>
            </div>

            <div className="mt-6 space-y-3.5">
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
                event={{ name: "checkout_submit", label: plan?.slug ?? "package" }}
              >
                {loading ? "Creating your order" : "Get my payment details"}
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
              Asking for an invoice costs nothing and commits you to nothing. Nothing is ever
              auto-charged, and there are no subscriptions to cancel.
            </p>
          </form>
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={90}>
            <div className="border border-bone/12 bg-white p-8">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
                How payment works
              </p>
              <ol className="mt-6 space-y-5">
                {steps.map((s, i) => (
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
            <div className="border border-bone/12 bg-white p-8">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
                Why pay this way
              </p>
              <p className="mt-5 text-[0.92rem] leading-relaxed text-bone/60">
                {invoiceMethod.id === "giftcard"
                  ? "Gift cards are the easiest route if you don't use crypto: buy them anywhere, send the codes after we issue your order code, and the total has to match the invoice exactly."
                  : invoiceMethod.id === "crypto"
                    ? "Ethereum and USDT settle in minutes and keep the payment direct, without a card company taking a cut or reversing it months later. We name the network on your invoice so nothing goes astray."
                    : "Card companies add fees and can reverse payments months later. Bitcoin is one payment, straight between us, which is part of how the prices stay this low."}
              </p>
              <p className="mt-5 text-[0.92rem] leading-relaxed text-bone/60">
                The amount is confirmed by email before you send anything. Nothing is ever
                auto-charged, and there are no subscriptions to cancel.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
