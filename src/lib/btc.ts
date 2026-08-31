const FALLBACK_RATE = 96_000;
const CACHE_MS = 5 * 60 * 1000;

let cached: { rate: number; at: number; live: boolean } | null = null;

/**
 * Best-effort BTC/USD reference rate used to print an indicative amount on
 * invoices. The binding amount is always confirmed by email, so a stale or
 * offline rate never misleads a payer.
 */
export async function getBtcRate(): Promise<{ rate: number; live: boolean }> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return { rate: cached.rate, live: cached.live };
  }

  const envRate = Number(process.env.BTC_USD_RATE ?? "");
  if (Number.isFinite(envRate) && envRate > 1000) {
    cached = { rate: envRate, at: Date.now(), live: false };
    return { rate: cached.rate, live: false };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad status");
    const data = (await res.json()) as { bitcoin?: { usd?: number } };
    const rate = Number(data.bitcoin?.usd ?? Number.NaN);
    if (!Number.isFinite(rate) || rate < 1000) throw new Error("bad rate");
    cached = { rate, at: Date.now(), live: true };
    return { rate: cached.rate, live: true };
  } catch {
    cached = { rate: FALLBACK_RATE, at: Date.now(), live: false };
    return { rate: FALLBACK_RATE, live: false };
  }
}

export function toBtc(usd: number, rate: number) {
  return (usd / rate).toFixed(6);
}

export function invoiceCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `ORR-${stamp}${rand}`;
}
