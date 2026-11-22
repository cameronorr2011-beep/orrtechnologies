"use client";

import { useState } from "react";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { FAQ, SITE, purchaseMailto } from "@/lib/content";

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
      setFeedback("Got it. We'll reply within one business day with a plan and next steps.");
      setForm({ name: "", email: "", company: "", message: "" });
    } catch {
      setState("error");
      setFeedback(`Something went wrong. Email us directly at ${SITE.emailDisplay}.`);
    }
  };

  const field =
    "w-full border border-bone/15 bg-transparent px-4 py-3.5 text-[0.9rem] text-bone placeholder:text-bone/25 transition-colors focus:border-ember-300 focus:outline-none";

  return (
    <section id="contact" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              kicker="10 / Questions"
              title={
                <>
                  Answers,
                  <br />
                  <span className="text-ember-300">without the pitch.</span>
                </>
              }
            />
            <div className="mt-9 border-t border-bone/10">
              {FAQ.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b border-bone/10">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="group flex w-full items-start justify-between gap-6 py-5 text-left"
                    >
                      <span
                        className={`text-[0.95rem] font-medium leading-snug transition-colors ${
                          isOpen ? "text-bone" : "text-bone/70 group-hover:text-bone"
                        }`}
                      >
                        {f.q}
                      </span>
                      <span
                        className={`mt-0.5 shrink-0 font-mono text-[0.9rem] transition-transform duration-300 ${
                          isOpen ? "rotate-45 text-ember-300" : "text-bone/35"
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    <div
                      className="grid transition-all duration-400"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="pb-6 pr-8 text-[0.88rem] leading-relaxed text-bone/50">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Reveal delay={100}>
              <form onSubmit={submit} className="border border-bone/12 p-6 sm:p-8">
                <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-ember-300">Start here</p>
                <h3 className="font-display mt-3 text-[1.7rem] font-semibold uppercase leading-tight tracking-[-0.03em] text-bone">
                  Tell us what you&apos;re building.
                </h3>

                <div className="mt-7 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your name"
                      className={field}
                      aria-label="Your name"
                    />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="Your email"
                      className={field}
                      aria-label="Your email"
                    />
                  </div>
                  <input
                    value={form.company}
                    onChange={set("company")}
                    placeholder="Business name"
                    className={field}
                    aria-label="Business name"
                  />
                  <textarea
                    required
                    value={form.message}
                    onChange={set("message")}
                    rows={5}
                    placeholder="What does your business do? What should the website do for you?"
                    className={`${field} resize-none`}
                    aria-label="What you need"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ActionButton
                    type="submit"
                    disabled={state === "loading"}
                    event={{ name: "lead_submit", label: "contact_section" }}
                  >
                    {state === "loading" ? "Sending" : "Send message"}
                  </ActionButton>
                  <ActionButton
                    href={purchaseMailto({ planName: "Your website", amountUsd: 100 })}
                    external
                    variant="ghost"
                    event={{ name: "purchase_click", label: "contact_purchase" }}
                  >
                    Email instead
                  </ActionButton>
                </div>

                {feedback ? (
                  <p
                    className={`mt-5 font-mono text-[0.66rem] leading-relaxed ${
                      state === "error" ? "text-maple" : "text-ember-300/85"
                    }`}
                  >
                    {feedback}
                  </p>
                ) : (
                  <p className="mt-5 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.16em] text-bone/30">
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
