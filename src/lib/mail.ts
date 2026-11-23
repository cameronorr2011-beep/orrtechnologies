import { SITE } from "@/lib/content";

/**
 * Where contact-form briefs are delivered. Defaults to the studio inbox, and
 * can be overridden in the host environment without touching code.
 */
export const LEAD_INBOX = process.env.LEAD_INBOX?.trim() || SITE.email;

type Lead = {
  name: string;
  email: string;
  company?: string | null;
  message: string;
  source?: string;
};

function plainText(lead: Lead) {
  return [
    `New brief from ${SITE.domain}`,
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Business: ${lead.company || "—"}`,
    `Source: ${lead.source || "site"}`,
    "",
    lead.message,
  ].join("\n");
}

/** Resend, when the host has a key and a verified sending address. */
async function sendWithResend(lead: Lead): Promise<boolean | null> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM || "VoidBuilds <onboarding@resend.dev>",
      to: [LEAD_INBOX],
      reply_to: lead.email,
      subject: `Website brief — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      text: plainText(lead),
    }),
    signal: AbortSignal.timeout(12_000),
  });

  return response.ok;
}

/**
 * FormSubmit needs no API key: the first submission sends a one-time
 * activation link to LEAD_INBOX, and every brief after that lands as email.
 */
async function sendWithFormSubmit(lead: Lead): Promise<boolean> {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(LEAD_INBOX)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: SITE.url,
      Referer: `${SITE.url}/`,
    },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      company: lead.company || "—",
      message: lead.message,
      source: lead.source || "site",
      _subject: `Website brief — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      _replyto: lead.email,
      _template: "table",
      _captcha: "false",
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) return false;
  const data = (await response.json().catch(() => ({}))) as { success?: string | boolean };
  return String(data.success ?? "true") !== "false";
}

/** Returns true when at least one delivery path accepted the brief. */
export async function sendLeadNotification(lead: Lead): Promise<boolean> {
  try {
    const resend = await sendWithResend(lead);
    if (resend === true) return true;
  } catch {
    /* fall through to the keyless path */
  }

  try {
    return await sendWithFormSubmit(lead);
  } catch {
    return false;
  }
}
