import { NextRequest, NextResponse } from "next/server";
import { getApplications, getThresholds } from "@/lib/db";
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
  const jobId = req.nextUrl.searchParams.get("jobId");
  const [applications, thresholds] = await Promise.all([
    getApplications(jobId ? Number(jobId) : undefined),
    getThresholds(),
  ]);

  const headers = [
    "Nom", "Email", "Poste actuel", "Entreprise", "Localisation",
    "Prétentions", "Score (%)", "Fit", "Compétences", "Gaps",
    "Étape pipeline", "Source", "Tags", "Notes",
  ];

  const rows = applications.map((app) => {
    const fit    = scoreToFit(app.score, thresholds);
    const skills = (app.candidate.skills as string[] | null) ?? [];
    const gaps   = (app.gaps             as string[] | null) ?? [];
    const tags   = (app.candidate.tags   as string[] | null) ?? [];

    const rawStages    = app.job.stages as string[] | null | undefined;
    const jobStages    = rawStages?.length ? rawStages : DEFAULT_STAGES;
    const stageIdx     = app.stageIndex ?? 0;
    const currentStage = jobStages[stageIdx] ?? jobStages[0] ?? "";

    return [
      app.candidate.name,
      app.candidate.email ?? "",
      app.candidate.role,
      app.candidate.company,
      app.candidate.location,
      app.candidate.salary ?? "",
      String(app.score),
      fit,
      skills.join("; "),
      gaps.join("; "),
      currentStage,
      app.candidate.source,
      tags.join("; "),
      app.notes ?? "",
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
