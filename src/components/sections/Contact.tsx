"use client";

import { useState } from "react";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { FAQ, PLANS, SITE, purchaseMailto } from "@/lib/content";

export default function Contact() {
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "contact_section" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "failed");
      setState("done");
      setFeedback("Received. You'll get a written reply from a senior engineer within one business day.");
      setForm({ name: "", email: "", company: "", message: "" });
    } catch {
      setState("error");
      setFeedback("Something blocked that. Email service@orrbiologicals.com directly.");
    }
  };

  const field =
    "w-full rounded-2xl border border-royal-300/15 bg-royal-950/50 px-5 py-3.5 text-[0.92rem] text-bone placeholder:text-bone/25 transition-colors focus:border-ember-300/55 focus:outline-none";

  return (
    <section id="contact" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              kicker="Questions"
              title={
                <>
                  The things buyers <span className="text-ember-gradient">actually ask</span>
                </>
              }
            />
            <div className="mt-10 divide-y divide-royal-300/10 border-y border-royal-300/10">
              {FAQ.map((f, i) => {
                const isOpen = open === i;
                return (
                  <Reveal key={f.q} delay={i * 40}>
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="group flex w-full items-start justify-between gap-6 py-5 text-left"
                      >
                        <span
                          className={`text-[1rem] font-medium transition-colors ${isOpen ? "text-ember-100" : "text-bone/80 group-hover:text-bone"}`}
                        >
                          {f.q}
                        </span>
                        <span
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                            isOpen ? "rotate-45 border-ember-300/60 text-ember-200" : "border-royal-300/25 text-bone/45"
                          }`}
                        >
                          +
                        </span>
                      </button>
                      <div
                        className="overflow-hidden transition-all duration-500"
                        style={{ maxHeight: isOpen ? "260px" : "0px", opacity: isOpen ? 1 : 0 }}
                      >
                        <p className="pb-6 pr-10 text-[0.92rem] leading-relaxed text-bone/55">{f.a}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <div>
            <Reveal delay={120}>
              <form onSubmit={submit} className="glass edge-glow rounded-[1.75rem] p-8">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
                  Open a build slot
                </p>
                <h3 className="font-display mt-4 text-[1.6rem] font-semibold leading-tight text-bone">
                  Tell us what the site has to do.
                </h3>

                <div className="mt-7 space-y-3.5">
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <input required value={form.name} onChange={set("name")} placeholder="Name" className={field} aria-label="Name" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="Work email"
                      className={field}
                      aria-label="Work email"
                    />
                  </div>
                  <input value={form.company} onChange={set("company")} placeholder="Company" className={field} aria-label="Company" />
                  <textarea
                    required
                    value={form.message}
                    onChange={set("message")}
                    rows={4}
                    placeholder="What are you selling, and to whom? Any deadline?"
                    className={`${field} resize-none`}
                    aria-label="Brief"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ActionButton
                    type="submit"
                    disabled={state === "loading"}
                    event={{ name: "lead_submit", label: "contact_section" }}
                  >
                    {state === "loading" ? "Sending" : "Send brief"}
                  </ActionButton>
                  <ActionButton
                    href={purchaseMailto({ planName: PLANS[1].name, amountUsd: PLANS[1].priceUsd })}
                    external
                    variant="ghost"
                    event={{ name: "purchase_click", label: "contact_purchase" }}
                  >
                    Email purchase desk
                  </ActionButton>
                </div>

                {feedback ? (
                  <p
                    className={`mt-5 font-mono text-[0.7rem] leading-relaxed ${
                      state === "error" ? "text-maple" : "text-ember-200/85"
                    }`}
                  >
                    {feedback}
                  </p>
                ) : (
                  <p className="mt-5 font-mono text-[0.64rem] uppercase leading-relaxed tracking-[0.16em] text-bone/35">
                    Or write straight to {SITE.emailDisplay}
                  </p>
                )}
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
