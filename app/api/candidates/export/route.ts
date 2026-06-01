import { NextRequest, NextResponse } from "next/server";
import { getCandidates, getThresholds } from "@/lib/db";
import { scoreToFit } from "@/lib/thresholds";
import { DEFAULT_STAGES } from "@/lib/stages";

function escape(val: string | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const jobId    = req.nextUrl.searchParams.get("jobId");
  const [candidates, thresholds] = await Promise.all([
    getCandidates(jobId ? Number(jobId) : undefined),
    getThresholds(),
  ]);

  const headers = [
    "Nom", "Email", "Poste actuel", "Entreprise", "Localisation",
    "Prétentions", "Score (%)", "Fit", "Compétences", "Gaps",
    "Étape pipeline", "Source", "Tags", "Notes",
  ];

  const rows = candidates.map((c) => {
    const fit    = scoreToFit(c.score, thresholds);
    const skills = (c.skills as string[] | null) ?? [];
    const gaps   = (c.gaps   as string[] | null) ?? [];
    const tags   = (c.tags   as string[] | null) ?? [];

    const rawStages    = (c.job as any).stages as string[] | null | undefined;
    const jobStages    = rawStages?.length ? rawStages : DEFAULT_STAGES;
    const stageIdx     = c.stageIndex ?? 0;
    const currentStage = jobStages[stageIdx] ?? jobStages[0] ?? "";

    return [
      c.name,
      c.email ?? "",
      c.role,
      c.company,
      c.location,
      c.salary ?? "",
      String(c.score),
      fit,
      skills.join("; "),
      gaps.join("; "),
      currentStage,
      c.source,
      tags.join("; "),
      c.notes ?? "",
    ].map(escape).join(",");
  });

  const csv      = [headers.join(","), ...rows].join("\n");
  const filename = jobId ? `candidats-poste-${jobId}.csv` : "candidats.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
