/**
 * Server-only contact address.
 *
 * Deliberately NOT exported from `content.ts`: that module is pulled into the
 * client bundle by nav and pricing, and the address must not ship in any page
 * HTML, RSC payload or JavaScript chunk. The only way to learn it is to ask
 * `/api/contact`, which exists so the address appears when someone clicks.
 */

export const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL?.trim() ||
  process.env.LEAD_INBOX?.trim() ||
  "cameronorr2011@gmail.com";

const PLAN_SUBJECT = "Website request";

/** A mailto URL, built on the server only. */
export function mailtoUrl(params: {
  planName?: string;
  invoiceCode?: string;
  amountUsd?: number;
  payment?: string;
  company?: string;
  name?: string;
  notes?: string;
}): string {
  const lines = [
    params.planName ? `Package: ${params.planName}` : null,
    params.invoiceCode ? `Invoice: ${params.invoiceCode}` : null,
    params.amountUsd
      ? `Amount: $${params.amountUsd.toLocaleString("en-US")} USD${params.payment ? ` — ${params.payment}` : ""}`
      : null,
    `Business name: ${params.company ?? ""}`,
    `Your name: ${params.name ?? ""}`,
    "",
    "Please send the invoice and next steps.",
    params.notes ? `\nNotes:\n${params.notes}` : "",
  ].filter((line): line is string => Boolean(line));

  const subject = `${PLAN_SUBJECT} — ${params.planName ?? "General enquiry"}${
    params.invoiceCode ? ` (${params.invoiceCode})` : ""
  }`;

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join("\n"),
  )}`;
}
