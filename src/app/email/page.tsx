import type { Metadata } from "next";
import Link from "next/link";
import MailRedirect from "@/components/site/MailRedirect";

export const metadata: Metadata = {
  title: "Opening your mail app",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

/**
 * Noindex handoff page. Every email CTA routes here so no `mailto:` with an
 * address in it ever ships in the HTML.
 */
export default async function EmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const subject = first("subject") ?? "Website request";
  const body = first("body");

  return (
    <section className="relative overflow-hidden pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-[720px] px-5 sm:px-8">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-electric">
          Handoff
        </span>
        <h1 className="display mt-6 text-[clamp(2.1rem,5vw,3.4rem)] text-ink">
          Opening your
          <br />
          mail app.
        </h1>
        <div className="mt-8">
          <MailRedirect subject={subject} body={body} />
        </div>
        <p className="mt-10 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink/35">
          <Link href="/" className="transition-colors hover:text-ink">
            ← Back to VoidBuilds
          </Link>
        </p>
      </div>
    </section>
  );
}
