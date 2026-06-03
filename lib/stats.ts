import type { Application, Job } from "@/entities/index";

export interface GapFrequency {
  skill: string;
  count: number;
  pct: number;
}

export interface FitDistribution {
  jobId: number;
  jobTitle: string;
  strong: number;
  medium: number;
  weak: number;
  total: number;
}

export function computeGapFrequency(applications: Application[]): GapFrequency[] {
  const freq: Record<string, number> = {};
  for (const app of applications) {
    const gaps = (app.gaps as string[] | null) ?? [];
    for (const g of gaps) freq[g] = (freq[g] ?? 0) + 1;
  }
  const total = applications.length || 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([skill, count]) => ({ skill, count, pct: Math.round((count / total) * 100) }));
}

export function computeFitDistribution(
  applications: Application[],
  jobs: Job[],
  scoreToFitFn: (score: number) => string
): FitDistribution[] {
  return jobs.map((job) => {
    const jobApps = applications.filter((a) => a.job.id === job.id);
    const strong  = jobApps.filter((a) => scoreToFitFn(a.score) === "strong").length;
    const medium  = jobApps.filter((a) => scoreToFitFn(a.score) === "medium").length;
    const weak    = jobApps.filter((a) => scoreToFitFn(a.score) === "weak").length;
    return { jobId: job.id, jobTitle: job.title, strong, medium, weak, total: jobApps.length };
  }).filter((d) => d.total > 0);
}
