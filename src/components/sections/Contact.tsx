"use client";

import { useState } from "react";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import ContactGate from "@/components/site/ContactGate";
import { FAQ, purchaseMailto } from "@/lib/content";

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
      setFeedback("Brief received. Cameron will reply within one business day with a plan, a start date and a fixed price.");
      setForm({ name: "", email: "", company: "", message: "" });
    } catch {
      setState("error");
      setFeedback("The form could not send. Use the email link above and it will land in the same inbox.");
    }
  };

  const field =
    "w-full border-2 border-ink/20 bg-white/55 px-4 py-3.5 text-[0.9rem] text-ink placeholder:text-ink/30 transition-colors focus:border-electric focus:bg-white focus:outline-none";

  return (
    <section id="contact" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              kicker="09 / Questions"
              title={
                <>
                  Common
                  <br />
                  <span className="text-electric">questions.</span>
                </>
              }
            />

            <Reveal delay={100}>
              <div className="mt-9 flex flex-col gap-4 border-2 border-ink bg-[#eef1ff] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-ink/50">
                    Prefer email?
                  </p>
                  <ContactGate
                    variant="link"
                    label="Show the address"
                    className="font-display mt-1 inline-block text-[1.05rem] font-bold tracking-[-0.01em] text-ink decoration-electric decoration-2 underline-offset-4"
                  />
                </div>
                <span className="inline-flex w-fit items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-ink/60">
                  <span className="h-2 w-2 bg-mint" aria-hidden="true" />
                  Replies in 1 business day
                </span>
              </div>
            </Reveal>

            <div className="mt-9 border-t-2 border-ink/15">
              {FAQ.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b-2 border-ink/10">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="group flex w-full items-start justify-between gap-6 py-5 text-left"
                    >
                      <span
                        className={`text-[0.95rem] font-medium leading-snug transition-colors ${
                          isOpen ? "text-ink" : "text-ink/70 group-hover:text-ink"
                        }`}
                      >
                        {f.q}
                      </span>
                      <span
                        className={`mt-0.5 shrink-0 font-mono text-[0.9rem] transition-transform duration-300 ${
                          isOpen ? "rotate-45 text-electric" : "text-ink/35"
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
                        <p className="pb-6 pr-8 text-[0.88rem] leading-relaxed text-ink/60">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Reveal delay={100}>
              <form
                onSubmit={submit}
                className="border-2 border-ink bg-paper p-6 shadow-[12px_12px_0_0_#14130f] sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-coral">
                    Start here
                  </p>
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2 w-2 bg-coral" />
                    <span className="h-2 w-2 bg-sun" />
                    <span className="h-2 w-2 bg-mint" />
                    <span className="h-2 w-2 bg-electric" />
                  </span>
                </div>
                <h3 className="font-display mt-3 text-[1.7rem] font-bold uppercase leading-tight tracking-[-0.03em] text-ink">
                  Tell us what you&apos;re building.
                </h3>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-ink/55">
                  Two minutes now saves a week later. Rough notes are fine.
                </p>

                <div className="mt-7 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your name"
                      className={field}
                      aria-label="Your name"
                    />
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="Your email"
                      className={field}
                      aria-label="Your email"
                    />
                  </div>
                  <input
                    autoComplete="organization"
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
                    href={purchaseMailto({ planName: "Website project" })}
                    external
                    variant="ghost"
                    event={{ name: "purchase_click", label: "contact_purchase" }}
                  >
                    Email instead
                  </ActionButton>
                </div>

                {feedback ? (
                  <p
                    className={`mt-5 border-l-2 pl-3 font-mono text-[0.66rem] leading-relaxed ${
                      state === "error" ? "border-maple text-maple" : "border-mint text-ink/70"
                    }`}
                  >
                    {feedback}
                  </p>
                ) : (
                  <p className="mt-5 border-l-2 border-ink/15 pl-3 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.14em] text-ink/40">
                    Goes straight to our inbox
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
