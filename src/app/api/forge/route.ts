import { NextResponse } from "next/server";
import { forgeSite } from "@/lib/forge";
import { saveForgeBuild } from "@/db/queries";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string; industry?: string; persist?: boolean };
    const prompt = String(body.prompt ?? "").trim();
    if (prompt.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Describe the business in a sentence or two (at least 8 characters)." },
        { status: 400 },
      );
    }

    const result = forgeSite(prompt, body.industry);

    if (body.persist !== false) {
      try {
        await saveForgeBuild({
          prompt: prompt.slice(0, 600),
          industry: result.industry,
          brandName: result.brandName,
          palette: result.palette,
          layoutSeed: result.layoutSeed,
          typography: result.typography,
          renderMs: result.renderMs,
        });
      } catch {
        /* the preview still returns even if persistence is unavailable */
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json({ ok: false, error: "Forge unavailable." }, { status: 500 });
  }
}
