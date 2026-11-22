import { NextResponse } from "next/server";
import { AGENT_CONTRACT, agentBrief, demoProject, normalizeProject, totalDuration } from "@/lib/cut";

const MAX_BODY = 3_000_000;

export async function GET() {
  return NextResponse.json({
    ok: true,
    contract: AGENT_CONTRACT,
    demo: demoProject(),
  });
}

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(length) && length > MAX_BODY) {
      return NextResponse.json({ ok: false, error: "Project is too large." }, { status: 413 });
    }

    const body = (await request.json()) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Send a JSON body." }, { status: 400 });
    }

    const project = normalizeProject(body.project ?? body);
    const duration = totalDuration(project);

    if (body.op === "brief") {
      const shots = project.clips.map(
        (clip, index) =>
          `${index + 1}. ${clip.name} · ${clip.duration}s · ${clip.headline || "no kicker"} — ${
            clip.caption || "no caption"
          }`,
      );
      return NextResponse.json({
        ok: true,
        project,
        duration,
        brief: {
          title: project.title,
          aspect: project.aspect,
          grade: project.grade,
          runtime: `${duration.toFixed(1)}s`,
          shots,
          project: agentBrief(project),
        },
      });
    }

    return NextResponse.json({ ok: true, project, duration });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not read that project." },
      { status: 400 },
    );
  }
}
