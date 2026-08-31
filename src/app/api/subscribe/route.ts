import { NextResponse } from "next/server";
import { addSubscriber } from "@/db/queries";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; interest?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!EMAIL.test(email)) {
      return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
    }
    await addSubscriber(email, body.interest ? String(body.interest).slice(0, 60) : undefined);
    return NextResponse.json({ ok: true, message: "You're on the dispatch list." });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not subscribe right now." }, { status: 500 });
  }
}
