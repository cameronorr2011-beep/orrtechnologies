import { NextResponse } from "next/server";
import { logEvent } from "@/db/queries";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      label?: string;
      meta?: Record<string, string | number>;
    };
    const name = (body.name ?? "").toString().slice(0, 60);
    const label = (body.label ?? "").toString().slice(0, 160);
    if (!name || !label) {
      return NextResponse.json({ ok: false, error: "name and label required" }, { status: 400 });
    }
    await logEvent(name, label, body.meta);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "unhandled" }, { status: 500 });
  }
}
